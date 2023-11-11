import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { CommandBus } from '@nestjs/cqrs';
import { EmailService } from '../email/email.service';
import { EmailConfirmationService } from './email-confirmation.service';
import {
  IAuthResponse,
  IChangePasswordRequest,
  IPasswordReset,
  IResetPasswordRequest,
  IRolePermission,
  IUser,
  IUserLoginInput,
  IUserRegistrationInput,
  PermissionsEnum,
} from '../../models';
import * as bcrypt from 'bcrypt';
import { RequestContext } from '../core';
import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import { ConfigService, environment } from '../../config';
import {
  PasswordResetCreateCommand,
  PasswordResetGetCommand,
} from '../password-reset/commands';
import { IAppIntegrationConfig } from '../../common';

@Injectable()
export class AuthService {
  protected readonly saltRounds: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly emailService: EmailService,
    private readonly commandBus: CommandBus,
  ) {
    this.saltRounds = this.configService.get(
      'USER_PASSWORD_BCRYPT_SALT_ROUNDS',
    ) as number;
  }

  /**
   * User Login Request
   *
   * @param email
   * @param password
   * @returns
   */
  async login({
    email,
    password,
  }: IUserLoginInput): Promise<IAuthResponse | null> {
    try {
      const user = await this.userService.findOneByOptions({
        where: {
          email,
          isActive: true,
          isArchived: false,
        },
        relations: {
          role: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      // If password is not matching with any user
      if (!(await bcrypt.compare(password, user.hash))) {
        throw new UnauthorizedException();
      }

      const accessToken = await this.getJwtAccessToken(user);
      const refreshToken = await this.getJwtRefreshToken(user);

      await this.userService.setCurrentRefreshToken(refreshToken, user.id);

      return {
        user,
        token: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.log('Error while authenticating user: %s', error);
      throw new UnauthorizedException();
    }
  }

  /**
   * Request Reset Password
   *
   * @param request
   * @param originUrl
   * @returns
   */
  async requestPassword(
    request: IResetPasswordRequest,
    originUrl?: string,
  ): Promise<boolean | BadRequestException> {
    const { email } = request;

    try {
      await this.userRepository.findOneByOrFail({
        email,
        isActive: true,
      });
    } catch (error) {
      throw new BadRequestException('Forgot password request failed!');
    }

    try {
      const user = await this.userService.findOneByOptions({
        where: {
          email,
          isActive: true,
        },
        relations: {
          role: true,
        },
      });
      /**
       * Create password reset request
       */
      const token = await this.getJwtAccessToken(user);
      if (token) {
        await this.commandBus.execute(
          new PasswordResetCreateCommand({
            email: user.email,
            token,
          }),
        );

        const url = `${environment.clientBaseUrl}/#/auth/reset-password?token=${token}`;
        this.emailService.requestPassword(user, url, originUrl);
        return true;
      }
    } catch (error) {
      throw new BadRequestException('Forgot password request failed!');
    }
  }

  /**
   * Change password
   *
   * @param request
   */
  async resetPassword(request: IChangePasswordRequest) {
    try {
      const { password, token } = request;
      const record: IPasswordReset = await this.commandBus.execute(
        new PasswordResetGetCommand({
          token,
        }),
      );
      if (record.expired) {
        throw new BadRequestException('Password Reset Failed.');
      }
      const { id } = verify(token, environment.JWT_SECRET) as {
        id: string;
      };
      try {
        const user = await this.userService.findOneByIdString(id);
        if (user) {
          const hash = await this.getPasswordHash(password);
          await this.userService.changePassword(user.id, hash);
          return true;
        }
      } catch (error) {
        throw new BadRequestException('Password Reset Failed.');
      }
    } catch (error) {
      throw new BadRequestException('Password Reset Failed.');
    }
  }

  /**
   * Register new user
   */
  async register(
    input: IUserRegistrationInput & Partial<IAppIntegrationConfig>,
  ): Promise<User> {
    /**
     * Register new user
     */
    const create = this.userRepository.create({
      ...input.user,
      ...(input.password
        ? {
            hash: await this.getPasswordHash(input.password),
          }
        : {}),
    });
    const entity = await this.userRepository.save(create);

    /**
     * Find latest register user with role
     */
    const user = await this.userRepository.findOne({
      where: {
        id: entity.id,
      },
      relations: {
        role: true,
      },
    });

    /**
     * Email verification
     */
    const { appName, appLogo, appSignature, appLink, appEmailConfirmationUrl } =
      input;
    if (!user.emailVerifiedAt) {
      await this.emailConfirmationService.sendEmailVerification(user, {
        appName,
        appLogo,
        appSignature,
        appLink,
        appEmailConfirmationUrl,
      });
    }
    this.emailService.welcomeUser(input.user, {
      appName,
      appLogo,
      appSignature,
      appLink,
    });
    return user;
  }

  async getAuthenticatedUser(id: string): Promise<User> {
    return this.userService.getIfExists(id);
  }

  async isAuthenticated(token: string): Promise<boolean> {
    try {
      const { id } = verify(token, environment.JWT_SECRET) as {
        id: string;
        thirdPartyId: string;
      };

      return this.userService.checkIfExists(id);
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        return false;
      } else {
        throw err;
      }
    }
  }

  /**
   * Check current user has role
   *
   * @param token
   * @param roles
   * @returns
   */
  async hasRole(roles: string[] = []): Promise<boolean> {
    try {
      const { role } = await this.userService.findOneByIdString(
        RequestContext.currentUserId(),
        {
          relations: {
            role: true,
          },
        },
      );
      return role ? roles.includes(role.name) : false;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        return false;
      } else {
        throw err;
      }
    }
  }

  /**
   * Check current user has permission
   *
   * @param token
   * @param permissions
   * @returns
   */
  async hasPermissions(permissions: PermissionsEnum[] = []): Promise<boolean> {
    try {
      const roleId = RequestContext.currentRoleId();
      return !!(await this.roleService.findOneByIdString(roleId, {
        where: {
          rolePermissions: {
            permission: In(permissions),
            enabled: true,
          },
        },
      }));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get JWT access token
   *
   * @param payload
   * @returns
   */
  public async getJwtAccessToken(request: Partial<IUser>) {
    try {
      const userId = request.id;
      const user = await this.userService.findOneByIdString(userId, {
        relations: {
          role: {
            rolePermissions: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
      const payload: JwtPayload = {
        id: user.id,
      };
      if (user.role) {
        payload.role = user.role.name;
        if (user.role.rolePermissions) {
          payload.permissions = user.role.rolePermissions
            .filter((rolePermission: IRolePermission) => rolePermission.enabled)
            .map(
              (rolePermission: IRolePermission) => rolePermission.permission,
            );
        } else {
          payload.permissions = null;
        }
      } else {
        payload.role = null;
      }
      return sign(payload, environment.JWT_SECRET, {});
    } catch (error) {
      console.log('Error while getting jwt access token', error);
    }
  }

  /**
   * Get JWT refresh token
   *
   * @param user
   * @returns
   */
  public async getJwtRefreshToken(user: Partial<IUser>) {
    try {
      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role ? user.role.name : null,
      };
      const refreshToken = sign(payload, environment.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: `${environment.JWT_REFRESH_TOKEN_EXPIRATION_TIME}s`,
      });
      return refreshToken;
    } catch (error) {
      console.log('Error while getting jwt refresh token', error);
    }
  }

  /**
   * Get JWT access token from JWT refresh token
   *
   * @returns
   */
  async getAccessTokenFromRefreshToken() {
    try {
      const user = RequestContext.currentUser();
      return {
        token: await this.getJwtAccessToken(user),
      };
    } catch (error) {
      console.log(
        'Error while getting jwt access token from refresh token',
        error,
      );
    }
  }

  public async getPasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
