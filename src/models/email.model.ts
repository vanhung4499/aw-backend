import { IBaseEntityModel } from './base-entity.model';
import {
  IEmailTemplateFindInput,
  IRelationalEmailTemplate,
} from './email-template.model';
import { IRelationalUser } from './user.model';
export interface IEmail
  extends IBaseEntityModel,
    IRelationalUser,
    IRelationalEmailTemplate {
  name: string;
  content: string;
  email: string;
  status?: EmailStatusEnum;
}
export interface IEmailUpdateInput
  extends IBaseEntityModel,
    IRelationalUser,
    Partial<IRelationalEmailTemplate> {
  name?: string;
  content?: string;
  email?: string;
  isArchived?: boolean;
}
export interface IResendEmailInput
  extends IBaseEntityModel,
    IRelationalUser,
    Partial<IRelationalEmailTemplate> {
  id: IEmail['id'];
  [x: string]: any;
}
export interface IEmailFindInput extends IBaseEntityModel, IRelationalUser {
  emailTemplate?: IEmailTemplateFindInput;
  emailTemplateId?: string;
  email?: string;
  isArchived?: boolean;
  status?: EmailStatusEnum;
}
export interface DisplayEmail {
  from: string;
  to: string;
  date: string;
}
export declare enum EmailStatusEnum {
  SENT = 'SENT',
  FAILED = 'FAILED',
}
