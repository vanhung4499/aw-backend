import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailVerificationController } from './email-verification.controller';
import { EmailConfirmationService } from './email-confirmation.service';
import { CommandHandlers } from './commands/handlers';
import { JwtRefreshTokenStrategy, JwtStrategy } from './strategies';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
      },
    ]),
    EmailModule,
    UserModule,
    RoleModule,
    PasswordResetModule,
    CqrsModule,
  ],
  controllers: [AuthController, EmailVerificationController],
  providers: [
    AuthService,
    EmailConfirmationService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    ...CommandHandlers,
  ],
  exports: [AuthService, EmailConfirmationService],
})
export class AuthModule {}
