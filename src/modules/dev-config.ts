import {
  DEFAULT_API_BASE_URL,
  DEFAULT_API_HOST,
  DEFAULT_API_PORT,
  IConfig,
} from '../common';
import { dbConnectionConfig } from '../config';

export const devConfig: IConfig = {
  apiConfigOptions: {
    host: process.env.API_HOST || DEFAULT_API_HOST,
    port: process.env.API_PORT || DEFAULT_API_PORT,
    baseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
    middleware: [],
  },
  dbConnectionOptions: {
    ...dbConnectionConfig,
  },
};
