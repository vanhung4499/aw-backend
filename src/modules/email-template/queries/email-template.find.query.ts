import { IQuery } from '@nestjs/cqrs';
import { ICustomizeEmailTemplateFindInput } from '../../../models';

export class FindEmailTemplateQuery implements IQuery {
  static readonly type = '[EmailTemplate] Find';

  constructor(public readonly input: ICustomizeEmailTemplateFindInput) {}
}
