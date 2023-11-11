import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { RolePermission } from './role-permission.entity';
import { RoleModule } from '../role/role.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      { path: 'role-permissions', module: RolePermissionModule },
    ]),
    forwardRef(() => TypeOrmModule.forFeature([RolePermission])),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    CqrsModule,
  ],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [TypeOrmModule, RolePermissionService],
})
export class RolePermissionModule {}
