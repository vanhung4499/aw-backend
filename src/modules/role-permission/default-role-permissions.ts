import { PermissionsEnum, RolesEnum } from '../../models';

export const DEFAULT_ROLE_PERMISSIONS = [
  {
    role: RolesEnum.ADMIN,
    defaultEnabledPermissions: [
      PermissionsEnum.USERS_VIEW,
      PermissionsEnum.USERS_EDIT,
      PermissionsEnum.CHANGE_ROLES_PERMISSIONS,
      PermissionsEnum.FILE_STORAGE_VIEW,
      PermissionsEnum.ACCESS_DELETE_ACCOUNT,
      PermissionsEnum.ACCESS_DELETE_ALL_DATA,
      PermissionsEnum.PROFILE_EDIT,
    ],
  },
  {
    role: RolesEnum.USER,
    defaultEnabledPermissions: [
      PermissionsEnum.ACCESS_DELETE_ACCOUNT,
      PermissionsEnum.PROFILE_EDIT,
    ],
  },
];
