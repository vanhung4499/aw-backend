import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAppIntegrationConfig, Public } from '../../common';
import { EmailConfirmationService } from './email-confirmation.service';
import { ConfirmEmailByCodeDTO, ConfirmEmailByTokenDTO } from './dto';

@ApiTags('Auth')
@Controller('email/verify')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailVerificationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  /**
   * Email verification by token
   *
   * @param body
   * @returns
   */
  @ApiOperation({ summary: 'Email verification by token' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async confirmEmail(
    @Body() body: ConfirmEmailByTokenDTO,
  ): Promise<Object> {
    const user = await this.emailConfirmationService.decodeConfirmationToken(
      body.token,
    );
    if (!!user) {
      return await this.emailConfirmationService.confirmEmail(user);
    }
  }

  /**
   * Email verification by token
   *
   * @param body
   * @returns
   */
  @ApiOperation({ summary: 'Email verification by code' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('code')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async confirmEmailByCode(
    @Body() body: ConfirmEmailByCodeDTO,
  ): Promise<Object> {
    const user = await this.emailConfirmationService.confirmationByCode(body);
    if (!!user) {
      return await this.emailConfirmationService.confirmEmail(user);
    }
  }

  /**
   * Resend email verification link
   *
   * @returns
   */
  @ApiOperation({ summary: 'Resend email verification link' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('resend-link')
  public async resendConfirmationLink(
    @Body() config: IAppIntegrationConfig,
  ): Promise<Object> {
    return await this.emailConfirmationService.resendConfirmationLink(config);
  }
}
