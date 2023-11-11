import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Not, Repository } from 'typeorm';
import { IRole, RolesEnum, SYSTEM_DEFAULT_ROLES } from '../../models';
import { CrudService } from '../core/crud';
import { Role } from './role.entity';

@Injectable()
export class RoleService extends CrudService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(roleRepository);
  }

  async createRoles(): Promise<IRole[] & Role[]> {
    const roles: IRole[] = [];
    const rolesNames = Object.values(RolesEnum);

    for await (const name of rolesNames) {
      const role = new Role();
      role.name = name;
      role.isSystem = SYSTEM_DEFAULT_ROLES.includes(name);
      roles.push(role);
    }
    return await this.roleRepository.save(roles);
  }

  /**
   * Few Roles can't be removed/delete
   * RolesEnum.ADMIN, RolesEnum.USER
   *
   * @param id
   * @returns
   */
  async delete(id: IRole['id']): Promise<DeleteResult> {
    return await super.delete(id, {
      where: {
        isSystem: false,
        name: Not(In(SYSTEM_DEFAULT_ROLES)),
      },
    });
  }
}
