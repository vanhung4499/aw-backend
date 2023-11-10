import { IQuery } from '@nestjs/cqrs';

export class EmailTemplateGeneratePreviewHandler implements IQuery {
  static readonly type = '[EmailTemplate] GeneratePreview';

  constructor(public readonly input: string) {}
}