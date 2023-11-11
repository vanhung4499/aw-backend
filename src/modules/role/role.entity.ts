import { BaseEntity } from '../core/entities/internal';
import { IRole, IRolePermission, RolesEnum } from '../../models';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { RolePermission } from '../role-permission/role-permission.entity';

@Entity('role')
export class Role extends BaseEntity implements IRole {
  @ApiProperty({ type: () => String, enum: RolesEnum })
  @IsNotEmpty()
  @Index()
  @Column()
  name: string;

  @ApiPropertyOptional({ type: () => Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  @Column({ default: false })
  isSystem?: boolean;

  /*
  |--------------------------------------------------------------------------
  | @OneToMany
  |--------------------------------------------------------------------------
  */

  /**
   * Role Permissions
   */
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    cascade: true,
  })
  rolePermissions?: IRolePermission[];
}
