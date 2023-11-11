import { MiddlewareConsumer, NestModule, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FileStorageModule } from './file-storage';
import { RequestContextMiddleware } from './context';

@Module({
  imports: [DatabaseModule, FileStorageModule],
  controllers: [],
  providers: [],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
