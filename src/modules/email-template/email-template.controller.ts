import {
  IEmailTemplate,
  IEmailTemplateSaveInput,
  IPagination,
  PermissionsEnum,
} from '../../models';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { CrudController, PaginationParams } from '../core';
import { RequestContext } from '../core';
import { PermissionGuard } from '../shared';
import { UUIDValidationPipe } from '../shared';
import { Permissions } from '../shared';
import { EmailTemplate } from './email-template.entity';
import { EmailTemplateService } from './email-template.service';
import {
  EmailTemplateGeneratePreviewQuery,
  EmailTemplateQuery,
  FindEmailTemplateQuery,
} from './queries';
import { EmailTemplateSaveCommand } from './commands';
import { EmailTemplateQueryDTO, SaveEmailTemplateDTO } from './dto';

@ApiTags('EmailTemplate')
@UseGuards(PermissionGuard)
@Permissions(PermissionsEnum.VIEW_ALL_EMAIL_TEMPLATES)
@Controller()
export class EmailTemplateController extends CrudController<EmailTemplate> {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {
    super(emailTemplateService);
  }

  /**
   * GET count for email templates in the same tenant
   *
   * @param options
   * @returns
   */
  @Get('count')
  @UsePipes(new ValidationPipe())
  async getCount(
    @Query() options: FindOptionsWhere<EmailTemplate>,
  ): Promise<number> {
    return await this.emailTemplateService.countBy({
      ...options,
    });
  }

  /**
   * GET email templates using pagination params
   *
   * @param options
   * @returns
   */
  @Get('pagination')
  @UsePipes(new ValidationPipe({ transform: true }))
  async pagination(
    @Query() options: PaginationParams<EmailTemplate>,
  ): Promise<IPagination<IEmailTemplate>> {
    return await this.emailTemplateService.paginate(options);
  }

  /**
   * GET specific email template by conditions
   *
   * @param options
   * @returns
   */
  @ApiOperation({
    summary: 'Find email template by name and language code for organization',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found email template',
    type: EmailTemplate,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @Get('template')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async findEmailTemplate(
    @Query() options: EmailTemplateQueryDTO,
  ): Promise<IEmailTemplate> {
    return await this.queryBus.execute(new FindEmailTemplateQuery(options));
  }

  /**
   * Generate email template preview
   *
   * @param data
   * @returns
   */
  @ApiOperation({
    summary: 'Converts mjml or handlebar text to html for email preview',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'text converted to html',
    type: EmailTemplate,
  })
  @Post('template/preview')
  async generatePreview(@Body('data') data: string): Promise<IEmailTemplate> {
    return await this.queryBus.execute(
      new EmailTemplateGeneratePreviewQuery(data),
    );
  }

  /**
   * SAVE email template
   *
   * @param entity
   * @returns
   */
  @ApiOperation({
    summary: 'Convert mjml or handlebar text to html',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'mjml or handlebar text converted to html',
    type: EmailTemplate,
  })
  @Post('template/save')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveEmailTemplate(
    @Body() entity: SaveEmailTemplateDTO,
  ): Promise<IEmailTemplate> {
    return await this.commandBus.execute(new EmailTemplateSaveCommand(entity));
  }

  /**
   * GET email templates in the same tenant
   *
   * @param options
   * @returns
   */
  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() options: PaginationParams<EmailTemplate>,
  ): Promise<IPagination<IEmailTemplate>> {
    return await this.queryBus.execute(new EmailTemplateQuery(options));
  }

  /**
   * FIND email template by id in the same tenant
   *
   * @param id
   * @returns
   */
  @ApiOperation({
    summary: 'Gets template by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'template found',
    type: EmailTemplate,
  })
  @Get(':id')
  async findById(
    @Param('id', UUIDValidationPipe) id: string,
  ): Promise<IEmailTemplate> {
    try {
      return await this.emailTemplateService.findOneByIdString(id);
    } catch (error) {
      throw new ForbiddenException();
    }
  }

  /**
   * UPDATE email template by id in the same tenant
   *
   * @param id
   * @param input
   * @returns
   */
  @ApiOperation({
    summary: 'Updates template',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'template updated',
    type: EmailTemplate,
  })
  @Put(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() input: IEmailTemplateSaveInput,
  ): Promise<IEmailTemplate | UpdateResult> {
    try {
      await this.findById(id);
      return await this.emailTemplateService.update({ id }, input);
    } catch (error) {
      throw new ForbiddenException();
    }
  }

  /**
   * DELETE email template by id in the same tenant
   *
   * @param id
   * @returns
   */
  @ApiOperation({
    summary: 'Delete email template',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email template deleted',
    type: EmailTemplate,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Email template not found',
  })
  @Delete(':id')
  async delete(@Param('id', UUIDValidationPipe) id: string) {
    try {
      await this.findById(id);
      return await this.emailTemplateService.delete({ id });
    } catch (error) {
      throw new ForbiddenException();
    }
  }
}
