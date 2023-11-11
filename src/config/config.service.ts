import { Injectable, Logger } from '@nestjs/common';
import { IApiServerOptions, IAssetOptions, IConfig } from '../common';
import { environment } from './environments/environment';
import { IEnvironment } from './environments/IEnvironment';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfig } from './config-manager';

@Injectable()
export class ConfigService {
  public config: Partial<IConfig>;
  private readonly environment = environment;
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    this.config = getConfig();

    for (const [key, value] of Object.entries(environment.env)) {
      process.env[key] = value;
    }

    this.logger.log(`Is Production: ${environment.production}`);
  }
  get apiConfigOptions(): IApiServerOptions {
    return this.config.apiConfigOptions;
  }

  get dbConnectionOptions(): TypeOrmModuleOptions {
    return this.config.dbConnectionOptions;
  }

  get assetOptions(): Required<IAssetOptions> {
    return this.config.assetOptions;
  }

  get<T>(key: keyof IEnvironment): IEnvironment[keyof IEnvironment] {
    return this.environment[key] as T;
  }

  isProd(): boolean {
    return this.environment.production;
  }
}
