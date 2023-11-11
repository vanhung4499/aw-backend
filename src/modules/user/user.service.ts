import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CrudService } from '../core';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DeleteResult,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { ConfigService, environment as env } from '../../config';
import { IUser, PermissionsEnum, RolesEnum } from '../../models';
import { freshTimestamp } from '../core';
import { RequestContext } from '../core';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import { isNotEmpty } from '../../common';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly _configService: ConfigService,
  ) {
    super(userRepository);
  }

  /**
   * Marked email as verified for user
   *
   * @param id
   * @returns
   */
  public async markEmailAsVerified(id: IUser['id']) {
    return await this.userRepository.update(
      { id },
      {
        emailVerifiedAt: freshTimestamp(),
        emailToken: null,
        code: null,
        codeExpireAt: null,
      },
    );
  }

  /**
   * GET user by email in the same tenant
   *
   * @param email
   * @returns
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.repository.findOneBy({
      email,
    });
  }

  /**
   * Check if, email address exist
   *
   * @param email
   * @returns
   */
  async checkIfExistsEmail(email: string): Promise<boolean> {
    return !!(await this.repository.findOneBy({
      email,
    }));
  }

  async checkIfExists(id: string): Promise<boolean> {
    return !!(await this.repository.findOneBy({
      id,
    }));
  }

  async getIfExists(id: string): Promise<User> {
    return await this.repository.findOneBy({
      id,
    });
  }

  async createOne(user: User): Promise<InsertResult> {
    return await this.repository.insert(user);
  }

  async changePassword(id: string, hash: string) {
    try {
      const user = await this.findOneByIdString(id);
      user.hash = hash;
      return await this.repository.save(user);
    } catch (error) {
      throw new ForbiddenException();
    }
  }

  /*
   * Update user profile
   */
  async updateProfile(id: string | number, entity: User): Promise<IUser> {
    /**
     * If user has only own profile edit permission
     */
    if (RequestContext.hasPermission(PermissionsEnum.PROFILE_EDIT)) {
      if (RequestContext.currentUserId() !== id) {
        throw new ForbiddenException();
      }
    }
    let user: IUser;
    try {
      if (typeof id == 'string') {
        user = await this.findOneByIdString(id, {
          relations: {
            role: true,
          },
        });
      }
      /**
       * If user try to update Admin without permission
       */
      if (user.role.name === RolesEnum.ADMIN) {
        if (!RequestContext.hasPermission(PermissionsEnum.ADMIN_EDIT)) {
          throw new ForbiddenException();
        }
      }
      if (entity['hash']) {
        entity['hash'] = await this.getPasswordHash(entity['hash']);
      }

      await this.save(entity);
      try {
        return await this.findOneByWhereOptions({
          id: id as string,
        });
      } catch {}
    } catch (error) {
      throw new ForbiddenException();
    }
  }

  private async getPasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, env.USER_PASSWORD_BCRYPT_SALT_ROUNDS);
  }

  /**
   * Find current logging user details
   *
   * @param relations
   * @returns
   */
  public async findMe(relations: string[]): Promise<IUser> {
    return await this.findOneByIdString(RequestContext.currentUserId(), {
      relations,
    });
  }

  /**
   * To permanently delete your account from app:
   *
   * @param userId
   * @param options
   * @returns
   */
  public async delete(userId: IUser['id']): Promise<DeleteResult> {
    const currentUserId = RequestContext.currentUserId();

    // If user try to delete someone other user account, just denied the request.
    if (currentUserId != userId) {
      throw new ForbiddenException(
        'You can not delete account for other users!',
      );
    }

    const user = await this.findOneByIdString(userId);
    if (!user) {
      throw new ForbiddenException('User not found for this ID!');
    }

    try {
      return await super.delete(userId);
    } catch (error) {
      throw new ForbiddenException(error?.message);
    }
  }

  /**
   * Set Current Refresh Token
   *
   * @param refreshToken
   * @param userId
   */
  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    try {
      if (refreshToken) {
        refreshToken = await bcrypt.hash(refreshToken, 10);
      }
      return await this.repository.update(userId, {
        refreshToken: refreshToken,
      });
    } catch (error) {
      console.log('Error while set current refresh token', error);
    }
  }

  /**
   * Removes the refresh token from the database.
   * Logout Device
   *
   * @param userId
   * @returns
   */
  async removeRefreshToken() {
    try {
      const userId = RequestContext.currentUserId();

      try {
        await this.repository.update(
          { id: userId },
          {
            refreshToken: null,
          },
        );
      } catch (error) {
        console.log('Error while remove refresh token', error);
      }
    } catch (error) {
      console.log('Error while logout device', error);
    }
  }

  /**
   * Get user if refresh token matches
   *
   * @param refreshToken
   * @param payload
   * @returns
   */
  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    payload: JwtPayload,
  ) {
    try {
      const { id, email, tenantId, role } = payload;
      const query = this.repository.createQueryBuilder('user');
      query.setFindOptions({
        join: {
          alias: 'user',
          leftJoin: {
            role: 'user.role',
          },
        },
      });
      query.where((query: SelectQueryBuilder<User>) => {
        query.andWhere(
          new Brackets((web: WhereExpressionBuilder) => {
            web.andWhere(`"${query.alias}"."id" = :id`, { id });
            web.andWhere(`"${query.alias}"."email" = :email`, {
              email,
            });
          }),
        );
        query.andWhere(
          new Brackets((web: WhereExpressionBuilder) => {
            if (isNotEmpty(tenantId)) {
              web.andWhere(`"${query.alias}"."tenantId" = :tenantId`, {
                tenantId,
              });
            }
            if (isNotEmpty(role)) {
              web.andWhere(`"role"."name" = :role`, { role });
            }
          }),
        );
        query.orderBy(`"${query.alias}"."createdAt"`, 'DESC');
      });
      const user = await query.getOneOrFail();
      const isRefreshTokenMatching = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (isRefreshTokenMatching) {
        return user;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
