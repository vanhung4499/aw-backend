import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RoleModule } from './role/role.module';
import { CoreModule } from './core/core.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { ConfigService } from '../config';
import { TransformInterceptor } from './core/interceptors';
import { DatabaseModule } from './database/database.module';
import { EmailTemplateModule } from './email-template/email-template.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => {
        return [
          {
            ttl: config.get('THROTTLE_TTL') as number,
            limit: config.get('THROTTLE_LIMIT') as number,
          },
        ];
      },
    }),
    CoreModule,
    AuthModule,
    UserModule,
    RoleModule,
    RolePermissionModule,
    EmailTemplateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [],
})
export class AppModule {}
