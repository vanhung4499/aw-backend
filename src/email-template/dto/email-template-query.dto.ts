import { OmitType } from '@nestjs/mapped-types';
import { SaveEmailTemplateDTO } from './save-email-template.dto';
import { IEmailTemplateFindInput } from '../../models';

/**
 * GET email template query request DTO validation
 */
export class EmailTemplateQueryDTO
  extends OmitType(SaveEmailTemplateDTO, ['mjml', 'subject'] as const)
  implements IEmailTemplateFindInput {}
