import { IBaseEntityModel } from './base-entity.model';

export interface IRelationalEmailTemplate {
  emailTemplate: IEmailTemplate;
  emailTemplateId: IEmailTemplate['id'];
}

export interface IEmailTemplate extends IBaseEntityModel {
  name: string;
  hbs: string;
  mjml: string;
  title?: string;
}

export interface IEmailTemplateFindInput extends IBaseEntityModel {
  name?: string;
}

export enum EmailTemplateEnum {
  PASSWORD_RESET = 'password',
  PASSWORD_LESS_AUTHENTICATION = 'password-less-authentication',
  WELCOME_USER = 'welcome-user',
  EMAIL_VERIFICATION = 'email-verification',
  EMAIL_RESET = 'email-reset',
}

export interface ICustomizeEmailTemplateFindInput extends IBaseEntityModel {
  name: EmailTemplateEnum;
}

export interface ICustomizableEmailTemplate {
  template: string;
  subject: string;
}

export interface IEmailTemplateSaveInput
  extends ICustomizeEmailTemplateFindInput {
  mjml: string;
  subject: string;
}
