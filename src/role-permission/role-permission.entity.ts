import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../core';
import { IRole, IRolePermission, PermissionsEnum } from '../models';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../role/role.entity';

@Entity('role_permission')
export class RolePermission extends BaseEntity implements IRolePermission {
  @ApiProperty({ type: () => String, enum: PermissionsEnum })
  @Index()
  @Column()
  permission: string;

  @ApiPropertyOptional({ type: () => Boolean, default: false })
  @Column({ nullable: true, default: false })
  enabled: boolean;

  @ApiPropertyOptional({ type: () => String })
  @Column({ nullable: true })
  description: string;

  /*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  role: IRole;

  @ApiProperty({ type: () => String })
  @RelationId((it: RolePermission) => it.role)
  @Index()
  @Column()
  roleId: string;
}
