import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigModule } from '../../config';
import { AppModule } from '../app.module';
import { Logger, LoggerModule } from '../logger';
import { SharedModule } from '../shared';

@Module({
  imports: [ConfigModule, AppModule, LoggerModule.forRoot(), SharedModule],
})
export class BootstrapModule implements NestModule, OnApplicationShutdown {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }

  async onApplicationShutdown(signal: string) {
    if (signal) {
      Logger.log(`Received shutdown signal: ${signal}`);
    }
  }
}
