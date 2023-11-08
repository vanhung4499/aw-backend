import { IBaseEntityModel } from './base-entity.model';
import { IRolePermission } from './role-permission.model';

export interface IRole extends IRoleCreateInput {
  isSystem?: boolean;
  rolePermissions?: IRolePermission[];
}

export interface IRoleCreateInput extends IBaseEntityModel {
  name: string;
}

export interface IRoleFindInput extends IBaseEntityModel {
  name?: string;
  isSystem?: boolean;
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface IRelationalRole {
  readonly role?: IRole;
  readonly roleId?: IRole['id'];
}

/** Default system role */
export const SYSTEM_DEFAULT_ROLES = [RolesEnum.ADMIN, RolesEnum.USER];
