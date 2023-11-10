import { EmailTemplateEnum, IEmailTemplateSaveInput } from '../../models';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

/**
 * Save email template request DTO validation
 */
export class SaveEmailTemplateDTO implements IEmailTemplateSaveInput {
  @ApiProperty({ type: () => String, enum: EmailTemplateEnum })
  @IsEnum(EmailTemplateEnum)
  readonly name: EmailTemplateEnum;

  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  readonly mjml: string;

  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  readonly subject: string;
}
