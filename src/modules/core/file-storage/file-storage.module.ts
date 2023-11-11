import { NestModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageMiddleware } from './file-storage.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [FileStorageMiddleware],
})
export class FileStorageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FileStorageMiddleware).forRoutes('*');
  }
}
