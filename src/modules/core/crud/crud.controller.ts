import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UUIDValidationPipe } from '../../shared';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseEntity } from '../entities';
import { ICrudService } from './icrud.service';
import { DeepPartial, FindOptionsWhere } from 'typeorm';
import { PaginationParams } from './pagination-params';
import { IPagination } from '../../../models';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'Forbidden',
})
@ApiBearerAuth()
export abstract class CrudController<T extends BaseEntity> {
  protected constructor(private readonly crudService: ICrudService<T>) {}

  @ApiOperation({ summary: 'Find all records counts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records count',
  })
  @Get('count')
  async getCount(
    @Query() options?: FindOptionsWhere<T>,
  ): Promise<number | void> {
    return await this.crudService.countBy(options);
  }

  @ApiOperation({ summary: 'Find all records using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records' /* type: IPagination<T> */,
  })
  @Get('pagination')
  async pagination(
    @Query() filter?: PaginationParams<T>,
    ...options: any[]
  ): Promise<IPagination<T> | void> {
    return this.crudService.paginate(filter);
  }

  @ApiOperation({ summary: 'find all' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records' /* type: IPagination<T> */,
  })
  @Get()
  async findAll(
    filter?: PaginationParams<T>,
    ...options: any[]
  ): Promise<IPagination<T>> {
    return this.crudService.findAll(filter);
  }

  @ApiOperation({ summary: 'Find by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one record' /*, type: T*/,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @Get(':id')
  async findById(
    @Param('id', UUIDValidationPipe) id: T['id'],
    ...options: any[]
  ): Promise<T> {
    return this.crudService.findOneByIdString(id);
  }

  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The record has been successfully created.' /*, type: T*/,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() entity: DeepPartial<T>, ...options: any[]): Promise<T> {
    return this.crudService.create(entity);
  }

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
    @Body() entity: QueryDeepPartialEntity<T>,
    ...options: any[]
  ): Promise<any> {
    return this.crudService.update(id, entity); // FIXME: https://github.com/typeorm/typeorm/issues/1544
  }

  @ApiOperation({ summary: 'Delete record' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The record has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':id')
  async delete(
    @Param('id', UUIDValidationPipe) id: string,
    ...options: any[]
  ): Promise<any> {
    return this.crudService.delete(id);
  }
}
