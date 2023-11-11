import {
  Injectable,
  BadRequestException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandBus } from '@nestjs/cqrs';
import {
  Repository,
  UpdateResult,
  FindManyOptions,
  Not,
  In,
  DeepPartial,
  FindOptionsWhere,
} from 'typeorm';
import {
  RolesEnum,
  IRolePermission,
  IPagination,
  PermissionsEnum,
} from '../../models';
import { pluck } from 'underscore';
import { CrudService } from '../core';
import { RequestContext } from '../core';
import { RolePermission } from './role-permission.entity';
import { Role } from '../role/role.entity';
import { RoleService } from '../role/role.service';

@Injectable()
export class RolePermissionService extends CrudService<RolePermission> {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly roleService: RoleService,
    private readonly _commandBus: CommandBus,
  ) {
    super(rolePermissionRepository);
  }

  /**
   * GET all role-permissions using API filter
   *
   * @param filter
   * @returns
   */
  public async findAllRolePermissions(
    filter?: FindManyOptions<RolePermission>,
  ): Promise<IPagination<RolePermission>> {
    const roleId = RequestContext.currentRoleId();

    /**
     * Find current user role
     */
    const role = await this.roleService.findOneByWhereOptions({
      id: roleId,
    });

    /**
     * If, SUPER_ADMIN users try to retrieve all role-permissions allow them.
     */
    if (role.name === RolesEnum.ADMIN) {
      return await this.findAll(filter);
    }
    /**
     * Only SUPER_ADMIN/ADMIN can have `PermissionsEnum.CHANGE_ROLES_PERMISSIONS` permission
     * SUPER_ADMIN can retrieve all role-permissions for assign TENANT.
     * ADMIN can retrieve role-permissions for lower roles (DATA_ENTRY, EMPLOYEE, CANDIDATE, MANAGER, VIEWER) & them self (ADMIN)
     */
    if (
      RequestContext.hasPermission(PermissionsEnum.CHANGE_ROLES_PERMISSIONS)
    ) {
      /**
       * Retrieve all role-permissions except "ADMIN" role
       */
      const roles = (
        await this.roleService.findAll({
          select: ['id'],
          where: {
            name: Not(RolesEnum.ADMIN),
          },
        })
      ).items;
      if (!filter.where) {
        /**
         * GET all role-permissions for USER roles, if specific role filter not used in API.
         *
         */
        filter['where'] = {
          roleId: In(pluck(roles, 'id')),
        };
      } else if (filter.where && filter.where['roleId']) {
        /**
         * If, ADMIN try to retrieve "SUPER_ADMIN" role-permissions via API filter, not allow them.
         * Retrieve current user role (ADMIN) all role-permissions.
         */
        if (!pluck(roles, 'id').includes(filter.where['roleId'])) {
          filter['where'] = {
            roleId,
          };
        }
      }
      return await this.findAll(filter);
    }

    /**
     * If (DATA_ENTRY, EMPLOYEE, CANDIDATE, MANAGER, VIEWER) roles users try to retrieve role-permissions.
     * Allow only to retrieve current users role-permissions.
     */
    filter['where'] = {
      roleId,
    };
    return await this.findAll(filter);
  }

  /**
   * Create permissions for lower roles users
   *
   * @param partialEntity
   * @returns
   */
  public async createPermission(
    partialEntity: DeepPartial<IRolePermission>,
  ): Promise<IRolePermission> {
    try {
      const currentRoleId = RequestContext.currentRoleId();

      /**
       * Find current user role
       */
      const role = await this.roleService.findOneByWhereOptions({
        id: currentRoleId,
      });

      let { roleId } = partialEntity;
      if (partialEntity['role'] instanceof Role) {
        roleId = partialEntity['role']['id'];
      }
      /**
       * User try to create permission for below role
       */
      const wantToCreatePermissionForRole =
        await this.roleService.findOneByIdString(roleId);
      /**
       * If current user has SUPER_ADMIN
       */
      if (role.name === RolesEnum.ADMIN) {
        /**
         * Reject request, if ADMIN try to create permissions for ADMIN role.
         */
        if (
          wantToCreatePermissionForRole.name === RolesEnum.ADMIN ||
          !RequestContext.hasPermission(
            PermissionsEnum.CHANGE_ROLES_PERMISSIONS,
          )
        ) {
          throw new NotAcceptableException(
            'You can not change/add your permissions to ADMIN',
          );
        }
        return await this.create(partialEntity);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async updatePermission(
    id: string | FindOptionsWhere<IRolePermission>,
    partialEntity: DeepPartial<IRolePermission>,
  ): Promise<UpdateResult | IRolePermission> {
    try {
      const currentRoleId = RequestContext.currentRoleId();

      /**
       * Find current user role
       */
      const role = await this.roleService.findOneByWhereOptions({
        id: currentRoleId,
      });

      let { roleId } = partialEntity;
      if (partialEntity['role'] instanceof Role) {
        roleId = partialEntity['role']['id'];
      }
      /**
       * User try to update permission for below role
       */
      const wantToUpdatePermissionForRole =
        await this.roleService.findOneByIdString(roleId);
      if (role.name === RolesEnum.ADMIN) {
        /**
         * Reject request, if ADMIN try to create permissions for ADMIN role.
         */
        if (
          wantToUpdatePermissionForRole.name === RolesEnum.ADMIN ||
          !RequestContext.hasPermission(
            PermissionsEnum.CHANGE_ROLES_PERMISSIONS,
          )
        ) {
          throw new NotAcceptableException(
            'You can not change/add your permissions to ADMIN',
          );
        }
        return await this.update(id, partialEntity);
      }
    } catch (err /*: WriteError*/) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * DELETE role permissions
   *
   * @param id
   * @returns
   */
  public async deletePermission(id: string) {
    try {
      const currentRoleId = RequestContext.currentRoleId();

      /**
       * Find current user role
       */
      const role = await this.roleService.findOneByWhereOptions({
        id: currentRoleId,
      });

      /**
       * User try to delete permission for below role
       */
      const { role: wantToDeletePermissionForRole } =
        await this.repository.findOne({
          where: { id },
          relations: ['role'],
        });
      if (role.name === RolesEnum.ADMIN) {
        /**
         * Reject request, if ADMIN try to create permissions for ADMIN role.
         */
        if (
          wantToDeletePermissionForRole.name === RolesEnum.ADMIN ||
          !RequestContext.hasPermission(
            PermissionsEnum.CHANGE_ROLES_PERMISSIONS,
          )
        ) {
          throw new NotAcceptableException(
            'You can not delete your permissions to ADMIN, please ask your SUPER_ADMIN to give you more permissions',
          );
        }
        return await this.delete(id);
      }
    } catch (error /*: WriteError*/) {
      throw new BadRequestException(error);
    }
  }
}
