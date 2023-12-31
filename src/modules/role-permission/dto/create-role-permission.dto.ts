import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import {
  IRole,
  IRolePermissionCreateInput,
  PermissionsEnum,
} from '../../../models';
import { IsRoleShouldExist } from '../../shared/validators';

/**
 * Create Role Permission DTO validation
 */
export class CreateRolePermissionDTO implements IRolePermissionCreateInput {
  @ApiProperty({ type: () => String, enum: PermissionsEnum })
  @IsNotEmpty()
  @IsEnum(PermissionsEnum, {
    message: 'permission `$value` must be a valid enum value',
  })
  readonly permission: PermissionsEnum;

  @ApiProperty({ type: () => Boolean })
  @IsBoolean()
  readonly enabled: boolean;

  @ApiProperty({ type: () => String })
  @ValidateIf((it) => !it.role)
  @IsNotEmpty()
  @IsRoleShouldExist({
    message: 'RoleId {$value} should be exist for this tenant.',
  })
  readonly roleId: string;

  @ApiProperty({ type: () => String })
  @ValidateIf((it) => !it.roleId)
  @IsNotEmpty()
  @IsRoleShouldExist({
    message: 'Role should be exist for this tenant.',
  })
  readonly role: IRole;
}
