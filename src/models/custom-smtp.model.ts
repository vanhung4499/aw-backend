import { IBaseEntityModel } from './base-entity.model';
export interface ICustomSmtp extends IBaseEntityModel {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  isValidate?: boolean;
  fromAddress?: string;
}
export interface ICustomSmtpFindInput extends IBaseEntityModel {
  id?: string;
}

export interface ICustomSmtpCreateInput extends ICustomSmtp {}

export interface IVerifySMTPTransport
  extends Omit<ICustomSmtpCreateInput, 'isValidate'> {}

export interface ICustomSmtpUpdateInput extends ICustomSmtpCreateInput {}

export declare enum SMTPSecureEnum {
  TRUE = 'True',
  FALSE = 'False',
}
