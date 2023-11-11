import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ParseJsonPipe,
  PermissionGuard,
  Permissions,
  UUIDValidationPipe,
} from '../shared';
import { IPagination, IRolePermission, PermissionsEnum } from '../../models';
import { CrudController, PaginationParams } from '../core';
import { RolePermission } from './role-permission.entity';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDTO, UpdateRolePermissionDTO } from './dto';
import { DeleteResult, UpdateResult } from 'typeorm';

@ApiTags('Role')
@UseGuards(PermissionGuard)
@Permissions(PermissionsEnum.CHANGE_ROLES_PERMISSIONS)
@Controller()
export class RolePermissionController extends CrudController<RolePermission> {
  constructor(private readonly rolePermissionService: RolePermissionService) {
    super(rolePermissionService);
  }

  /**
   * GET role-permissions for specific user
   *
   * @param options
   * @returns
   */
  @Get('pagination')
  async pagination(
    @Query() options: PaginationParams<RolePermission>,
  ): Promise<IPagination<IRolePermission>> {
    return await this.rolePermissionService.findAllRolePermissions(options);
  }

  /**
   * GET all role permissions
   *
   * @param data
   * @returns
   */
  @ApiOperation({ summary: 'Find role permissions.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found role permissions.',
    type: RolePermission,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('data', ParseJsonPipe) data: any,
  ): Promise<IPagination<IRolePermission>> {
    const { findInput } = data;
    return this.rolePermissionService.findAllRolePermissions({
      where: findInput,
    });
  }

  /**
   * CREATE role permissions for specific tenant
   *
   * @param entity
   * @returns
   */
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    entity: CreateRolePermissionDTO,
  ): Promise<IRolePermission> {
    return this.rolePermissionService.createPermission(entity);
  }

  /**
   * UPDATE role permissions
   *
   * @param id
   * @param entity
   * @returns
   */
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The record has been successfully edited.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    entity: UpdateRolePermissionDTO,
  ): Promise<UpdateResult | IRolePermission> {
    return await this.rolePermissionService.updatePermission(id, entity);
  }

  /**
   * DELETE role permissions
   *
   * @param id
   * @returns
   */
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':id')
  async delete(
    @Param('id', UUIDValidationPipe) id: string,
  ): Promise<DeleteResult> {
    return await this.rolePermissionService.deletePermission(id);
  }
}
