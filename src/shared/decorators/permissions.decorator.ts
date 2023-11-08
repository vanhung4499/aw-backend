import { SetMetadata } from '@nestjs/common';
import { PermissionsEnum } from '../../models';
import { PERMISSIONS_METADATA } from '../../common';

export const Permissions = (...permissions: PermissionsEnum[]) =>
  SetMetadata(PERMISSIONS_METADATA, permissions);
