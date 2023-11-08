import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DynamicModule, Type } from '@nestjs/common';
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

export interface IPluginConfig {
  apiConfigOptions: IApiServerOptions;

  dbConnectionOptions: TypeOrmModuleOptions;

  plugins?: Array<DynamicModule | Type<any>>;

  logger?: ILogger;

  authOptions?: IAuthOptions;

  assetOptions?: IAssetOptions;
}
