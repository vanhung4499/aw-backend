import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { Reflector } from '@nestjs/core';
import { PermissionsEnum } from '../../../models';
import { PERMISSIONS_METADATA, isEmpty, removeDuplicates } from '../../../common';
import { RequestContext } from '../../core/context';
import { verify } from 'jsonwebtoken';
import { environment as env } from '../../../config';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let isAuthorized = false;
    /*
     * Retrieve metadata for a specified key for a specified set of permissions
     */
    const permissions =
      removeDuplicates(
        this._reflector.getAllAndOverride<PermissionsEnum[]>(
          PERMISSIONS_METADATA,
          [
            context.getHandler(), // Method Roles
            context.getClass(), // Controller Roles
          ],
        ),
      ) || [];

    if (isEmpty(permissions)) {
      isAuthorized = true;
    } else {
      const token = RequestContext.currentToken();
      const { id } = verify(token, env.JWT_SECRET) as {
        id: string;
        role: string;
      };
      const user = await this.userService.findOneByIdString(id, {
        relations: {
          role: {
            rolePermissions: true,
          },
        },
      });
      isAuthorized = !!user.role.rolePermissions.find(
        (p) => permissions.indexOf(p.permission) > -1 && p.enabled,
      );
      if (!isAuthorized) {
        console.log(
          'Unauthorized access blocked. UserId:',
          id,
          ' Permissions Checked:',
          permissions,
        );
      }
    }
    return isAuthorized;
  }
}
