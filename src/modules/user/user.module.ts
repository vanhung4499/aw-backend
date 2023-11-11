import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([{ path: 'user', module: UserModule }]),
    forwardRef(() => TypeOrmModule.forFeature([User])),
    CqrsModule,
  ],
  controllers: [UserController],
  providers: [UserService, ...CommandHandlers],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
