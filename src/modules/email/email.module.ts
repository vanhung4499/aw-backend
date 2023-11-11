import { forwardRef, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplateRenderService } from './email-template-render.service';
import { EmailTemplateModule } from '../email-template';
import { EmailSendService } from './email-send.service';

@Module({
  imports: [forwardRef(() => EmailTemplateModule)],
  providers: [EmailService, EmailSendService, EmailTemplateRenderService],
  exports: [EmailService],
})
export class EmailModule {}
