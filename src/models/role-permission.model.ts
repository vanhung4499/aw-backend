import { IBaseEntityModel } from './base-entity.model';
import { IRole } from './role.model';

export interface IRolePermission extends IBaseEntityModel {
  roleId: string;
  permission: string;
  role: IRole;
  enabled: boolean;
  description: string;
}

export interface IRolePermissionCreateInput extends IBaseEntityModel {
  role?: IRole;
  roleId: string;
  permission: string;
  enabled: boolean;
}

export interface IRolePermissionUpdateInput extends IRolePermissionCreateInput {
  enabled: boolean;
}

export enum PermissionsEnum {
  ADMIN_EDIT = 'ADMIN_EDIT',
  USERS_EDIT = 'USERS_EDIT',
  USERS_VIEW = 'USERS_VIEW',
  PROFILE_EDIT = 'PROFILE_EDIT',
  CHANGE_ROLES_PERMISSIONS = 'CHANGE_ROLES_PERMISSIONS',
  ACCESS_DELETE_ALL_DATA = 'ACCESS_DELETE_ALL_DATA',
  FILE_STORAGE_VIEW = 'FILE_STORAGE_VIEW',
  ACCESS_DELETE_ACCOUNT = 'ACCESS_DELETE_ACCOUNT',
  VIEW_ALL_EMAIL_TEMPLATES = 'VIEW_ALL_EMAIL_TEMPLATES',
}

export const PermissionGroups = {
  //Permissions which can be given to any role
  GENERAL: [
    PermissionsEnum.ACCESS_DELETE_ACCOUNT,
    PermissionsEnum.USERS_VIEW,
    PermissionsEnum.PROFILE_EDIT,
  ],

  //Readonly permissions, are only enabled for Admin role
  ADMINISTRATION: [
    PermissionsEnum.USERS_EDIT,
    PermissionsEnum.USERS_VIEW,
    PermissionsEnum.ACCESS_DELETE_ALL_DATA,
    PermissionsEnum.CHANGE_ROLES_PERMISSIONS,
    PermissionsEnum.FILE_STORAGE_VIEW,
    PermissionsEnum.ADMIN_EDIT,
    PermissionsEnum.VIEW_ALL_EMAIL_TEMPLATES,
  ],
};
