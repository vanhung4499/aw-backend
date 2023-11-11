import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { IUser, EmailTemplateEnum } from '../../models';
import { ConfigService, environment as env } from '../../config';
import { deepMerge, IAppIntegrationConfig } from '../../common';
import { EmailSendService } from './email-send.service';
import { EmailTemplate } from '../email-template';

const DISALLOW_EMAIL_SERVER_DOMAIN: string[] = ['@example.com'];

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,

    private readonly _emailSendService: EmailSendService,
    private readonly configService: ConfigService,
  ) {}

  /**
   *
   * @param user
   * @param integration
   */
  async welcomeUser(user: IUser, integration?: IAppIntegrationConfig) {
    /**
     * Override the default config by merging in the provided values.
     *
     */
    deepMerge(integration, env.appIntegrationConfig);

    const sendOptions = {
      template: EmailTemplateEnum.WELCOME_USER,
      message: {
        to: `${user.email}`,
      },
      locals: {
        email: user.email,
        host: env.clientBaseUrl,
        ...integration,
      },
    };

    try {
      const body = {
        templateName: sendOptions.template,
        email: sendOptions.message.to,
        message: '',
      };
      const match = !!DISALLOW_EMAIL_SERVER_DOMAIN.find((server) =>
        body.email.includes(server),
      );
      if (!match) {
        try {
          const instance = await this._emailSendService.getInstance();
          const send = await instance.send(sendOptions);

          body['message'] = send.originalMessage;
        } catch (error) {
          console.log(
            'Error while get email instance during welcome user',
            error,
          );
        }
      }
    } catch (error) {
      console.log('Error while sending welcome user', error);
    }
  }

  /**
   * Send confirmation email link
   *
   * @param user
   * @param verificationLink
   * @param verificationCode
   * @param thirdPartyIntegration
   */
  async emailVerification(
    user: IUser,
    verificationLink: string,
    verificationCode: string,
    thirdPartyIntegration: IAppIntegrationConfig,
  ) {
    const { email, firstName, lastName } = user;
    const name = [firstName, lastName].filter(Boolean).join(' ');

    /**
     * Override the default config by merging in the provided values.
     *
     */
    const integration = Object.assign(
      {},
      env.appIntegrationConfig,
      thirdPartyIntegration,
    );
    /**
     * Email template email options
     */
    const sendOptions = {
      template: EmailTemplateEnum.EMAIL_VERIFICATION,
      message: {
        to: `${email}`,
      },
      locals: {
        name,
        email,
        verificationLink,
        verificationCode,
        ...integration,
        host: env.clientBaseUrl,
      },
    };
    const body = {
      templateName: sendOptions.template,
      email: sendOptions.message.to,
      message: '',
    };
    const match = !!DISALLOW_EMAIL_SERVER_DOMAIN.find((server) =>
      body.email.includes(server),
    );
    if (!match) {
      try {
        const instance = await this._emailSendService.getInstance();
        const send = await instance.send(sendOptions);

        body['message'] = send.originalMessage;
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   *
   * @param user
   * @param url
   * @param originUrl
   */
  async requestPassword(user: IUser, url: string, originUrl?: string) {
    const sendOptions = {
      template: EmailTemplateEnum.PASSWORD_RESET,
      message: {
        to: `${user.email}`,
        subject: 'Forgotten Password',
      },
      locals: {
        generatedUrl: url,
        host: originUrl || env.clientBaseUrl,
      },
    };
    const body = {
      templateName: sendOptions.template,
      email: sendOptions.message.to,
      message: '',
    };
    const match = !!DISALLOW_EMAIL_SERVER_DOMAIN.find((server) =>
      body.email.includes(server),
    );
    if (!match) {
      try {
        const instance = await this._emailSendService.getInstance();
        const send = await instance.send(sendOptions);

        body['message'] = send.originalMessage;
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Password Less Authentication
   *
   * @param email
   * @param code
   * @param integration
   */
  async passwordLessAuthentication(
    email: IUser['email'],
    code: IUser['code'],
    integration?: IAppIntegrationConfig,
  ) {
    /**
     * Override the default config by merging in the provided values.
     *
     */
    deepMerge(integration, env.appIntegrationConfig);

    const sendOptions = {
      template: EmailTemplateEnum.PASSWORD_LESS_AUTHENTICATION,
      message: {
        to: `${email}`,
      },
      locals: {
        email,
        host: env.clientBaseUrl,
        inviteCode: code,
        ...integration,
      },
    };
    const body = {
      templateName: sendOptions.template,
      email: sendOptions.message.to,
      message: '',
    };
    const match = !!DISALLOW_EMAIL_SERVER_DOMAIN.find((server) =>
      body.email.includes(server),
    );
    if (!match) {
      try {
        const instance = await this._emailSendService.getInstance();
        const send = await instance.send(sendOptions);

        body['message'] = send.originalMessage;
      } catch (error) {
        console.log(
          'Error while sending password less authentication code: %s',
          error,
        );
      }
    }
  }

  /**
   * Email Reset
   *
   * @param user
   * @param verificationCode
   */
  async emailReset(user: IUser, verificationCode: string) {
    const integration = Object.assign({}, env.appIntegrationConfig);

    const sendOptions = {
      template: EmailTemplateEnum.EMAIL_RESET,
      message: {
        to: `${user.email}`,
      },
      locals: {
        ...integration,
        email: user.email,
        host: env.clientBaseUrl,
        verificationCode,
        name: user.name,
      },
    };
    const body = {
      templateName: sendOptions.template,
      email: sendOptions.message.to,
      message: '',
      user: user,
    };

    const match = !!DISALLOW_EMAIL_SERVER_DOMAIN.find((server) =>
      body.email.includes(server),
    );
    if (!match) {
      try {
        const instance = await this._emailSendService.getInstance();
        const send = await instance.send(sendOptions);

        body['message'] = send.originalMessage;
      } catch (error) {
        console.log(
          'Error while sending password less authentication code: %s',
          error,
        );
      }
    }
  }

  // tested e-mail send functionality
  private async nodemailerSendEmail(user: IUser, url: string) {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    // Gmail example:
    // const transporter = nodemailer.createTransport({
    // 	service: 'gmail',
    // 	auth: {
    // 		user: 'user@gmail.com',
    // 		pass: 'password'
    // 	}
    // });
    const info = await transporter.sendMail({
      from: 'AW',
      to: user.email,
      subject: 'Forgotten Password',
      text: 'Forgot Password',
      html:
        'Hello! <br><br> We received a password change request.<br><br>If you requested to reset your password<br><br>' +
        '<a href=' +
        url +
        '>Click here</a>',
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
}
