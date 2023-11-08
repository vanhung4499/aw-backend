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

import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { RoleModule } from './role/role.module';
import { CoreModule } from './core/core.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { ConfigService, environment } from './config';
import { SharedModule } from './shared';
import { TransformInterceptor } from './core/interceptors';
import { DatabaseModule } from './database/database.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
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

    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    UploadModule,
    EmailModule,
    RoleModule,
    CoreModule,
    RolePermissionModule,
    SharedModule,
    DatabaseModule,
    BootstrapModule,
    LoggerModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
