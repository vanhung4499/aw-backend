import { IBaseEntityModel } from './base-entity.model';
import { IRelationalImageAsset } from './image-asset.model';
import { IRole } from './role.model';

export interface IRelationalUser {
  user?: IUser;
  userId?: IUser['id'];
}

export interface IUser extends IBaseEntityModel, IRelationalImageAsset {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  role?: IRole;
  roleId?: IRole['id'];
  hash?: string;
  imageUrl?: string;
  fullName?: string;
  code?: string;
  codeExpireAt?: Date;
  emailVerifiedAt?: Date;
  isEmailVerified?: boolean;
  emailToken?: string;
}

export interface IUserFindInput extends IBaseEntityModel {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  role?: IRole;
  roleId?: string;
  hash?: string;
  imageUrl?: string;
}

export interface IUserRegistrationInput {
  user: IUser;
  password?: string;
  confirmPassword?: string;
}

/**
 * email verification token payload
 */
export interface IVerificationTokenPayload extends IUserEmailInput {
  id: string;
}

export interface IUserEmailInput {
  email: string;
}

export interface IUserPasswordInput {
  password: string;
}

export interface IUserTokenInput {
  token: string;
}

export interface IUserCodeInput {
  code: string;
}

export interface IUserLoginInput extends IUserEmailInput, IUserPasswordInput {}

export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken?: string;
}

export interface IUserCreateInput extends IRelationalImageAsset {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  role?: IRole;
  roleId?: string;
  hash?: string;
  imageUrl?: string;
}

export interface IUserUpdateInput extends IUserCreateInput {
  id?: string;
}

export enum ProviderEnum {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
}

export interface IUserViewModel extends IBaseEntityModel {
  fullName: string;
  email: string;
  bonus?: number;
  id: string;
  roleName?: string;
  role?: string;
}
