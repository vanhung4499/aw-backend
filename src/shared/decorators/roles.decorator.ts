import { RolesEnum } from '../../models';
import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ROLES_METADATA } from '../../common';

export const Roles = (...roles: RolesEnum[]): CustomDecorator =>
  SetMetadata(ROLES_METADATA, roles);
