import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ILogger } from './ILogger';

export interface IAssetOptions {
  assetPath: string;

  assetPublicPath: string;
}
export interface IApiServerOptions {
  host?: string;

  port: number | string;

  baseUrl?: string;

  middleware?: any;
}

export interface IAuthOptions {
  expressSessionSecret: string;

  userPasswordBcryptSaltRounds: number;

  jwtSecret: string;
}

export interface IConfig {
  apiConfigOptions: IApiServerOptions;

  dbConnectionOptions: TypeOrmModuleOptions;

  logger?: ILogger;

  authOptions?: IAuthOptions;

  assetOptions?: IAssetOptions;
}
