import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Email from 'email-templates';
import { ISMTPConfig } from '../../common';
import { IVerifySMTPTransport } from '../../models';
import { EmailTemplate } from '../core/entities';
import { SMTPUtils } from './utils';
import { EmailTemplateRenderService } from './email-template-render.service';

@Injectable()
export class EmailSendService {
  constructor(
    @InjectRepository(EmailTemplate)
    protected readonly emailTemplateRepository: Repository<EmailTemplate>,

    private readonly emailTemplateRenderService: EmailTemplateRenderService,
  ) {}

  /**
   *
   * @returns
   */
  public async getInstance(): Promise<Email<any>> {
    try {
      const smtpConfig: ISMTPConfig = SMTPUtils.defaultSMTPTransporter();
      const transport: IVerifySMTPTransport =
        SMTPUtils.convertSmtpToTransporter(smtpConfig);

      console.log('Default SMTP configuration: %s', transport);

      /** Verifies SMTP configuration */
      if (!!(await SMTPUtils.verifyTransporter(transport))) {
        return this.getEmailConfig(smtpConfig);
      }
    } catch (error) {
      console.log(
        'Error while retrieving default global smtp configuration: %s',
        error?.message,
      );
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param smtpConfig
   * @returns
   */
  private getEmailConfig(smtpConfig: ISMTPConfig): Email<any> {
    const config: Email.EmailConfig<any> = {
      message: {
        from: smtpConfig.fromAddress || 'noreply@aw.co',
      },
      // if you want to send emails in development or test environments, set options.send to true.
      send: true,
      transport: smtpConfig,
      i18n: {},
      views: {
        options: {
          extension: 'hbs',
        },
      },
      render: this.emailTemplateRenderService.render,
    };
    return new Email(config);
  }
}
