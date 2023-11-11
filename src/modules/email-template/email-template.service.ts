import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mjml2html from 'mjml';
import { EmailTemplateEnum, IEmailTemplate, IPagination } from '../../models';
import { EmailTemplate } from './email-template.entity';
import { CrudService, PaginationParams } from '../core';

@Injectable()
export class EmailTemplateService extends CrudService<EmailTemplate> {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailRepository: Repository<EmailTemplate>,
  ) {
    super(emailRepository);
  }

  /**
   * Get Email Templates
   * @param params
   * @returns
   */
  async findAll(
    params: PaginationParams<EmailTemplate>,
  ): Promise<IPagination<IEmailTemplate>> {
    const query = this.repository.createQueryBuilder('email_template');
    query.setFindOptions({
      select: {},
      ...(params && params.relations
        ? {
            relations: params.relations,
          }
        : {}),
      ...(params && params.order
        ? {
            order: params.order,
          }
        : {}),
    });
    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }

  /**
   * Insert or update global missing email templates in database.
   *
   * @param name
   * @param type
   * @param content
   * @returns
   */
  async saveTemplate(
    name: EmailTemplateEnum,
    type: 'html' | 'subject',
    content: IEmailTemplate,
  ): Promise<IEmailTemplate> {
    let entity: IEmailTemplate;
    try {
      const emailTemplate = await this.findOneByWhereOptions({
        name: `${name}/${type}`,
      });
      switch (type) {
        case 'subject':
          entity = {
            ...emailTemplate,
            hbs: content.hbs,
          };
          break;
        case 'html':
          entity = {
            ...emailTemplate,
            mjml: content.mjml,
            hbs: mjml2html(content.mjml).html,
          };
          break;
      }
      await super.create({ id: emailTemplate.id, ...entity });
    } catch (error) {
      entity = new EmailTemplate();
      entity.name = `${name}/${type}`;
      switch (type) {
        case 'subject':
          entity.hbs = content.hbs;
          break;
        case 'html':
          entity.mjml = content.mjml;
          entity.hbs = mjml2html(content.mjml).html;
          break;
      }
      await super.create(entity);
    }
    return entity;
  }
}
