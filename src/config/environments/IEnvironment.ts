import { FileStorageProviderEnum } from '../../models';
import {
  IAppIntegrationConfig,
  IAwsConfig,
  ICloudinaryConfig,
  IGoogleConfig,
  ISMTPConfig,
} from '../../common';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * environment variables that goes into process.env
 */
export interface Env {
  LOG_LEVEL?: LogLevel;
  [key: string]: string;
}

export interface FileSystem {
  name: FileStorageProviderEnum;
}

/**
 * Server Environment
 */
export interface IEnvironment {
  port: number | string;
  host: string;
  baseUrl: string;
  clientBaseUrl: string;

  production: boolean;
  envName: string;

  env?: Env;

  EXPRESS_SESSION_SECRET: string;
  USER_PASSWORD_BCRYPT_SALT_ROUNDS?: number;

  JWT_SECRET?: string;
  JWT_TOKEN_EXPIRATION_TIME?: number;

  /**
   * JWT refresh token Options
   */
  JWT_REFRESH_TOKEN_SECRET?: string;
  JWT_REFRESH_TOKEN_EXPIRATION_TIME?: number;

  /**
   * Email verification options
   */
  JWT_VERIFICATION_TOKEN_SECRET?: string;
  JWT_VERIFICATION_TOKEN_EXPIRATION_TIME?: number;

  /**
   * Throttler (Rate Limiting) Options
   */
  THROTTLE_TTL?: number;
  THROTTLE_LIMIT?: number;

  fileSystem: FileSystem;
  awsConfig?: IAwsConfig;
  cloudinaryConfig?: ICloudinaryConfig;
  googleConfig: IGoogleConfig;

  /**
   * SMTP Config
   */
  smtpConfig?: ISMTPConfig;

  /**
   * Email Template Config
   */
  appIntegrationConfig?: IAppIntegrationConfig;

  /**
   * Email Reset
   */
  EMAIL_RESET_EXPIRATION_TIME?: number;
}
