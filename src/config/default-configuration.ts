import * as dotenv from 'dotenv';
dotenv.config();

import {
  DEFAULT_API_HOST,
  DEFAULT_API_PORT,
  DEFAULT_API_BASE_URL,
  IConfig,
} from '../common';
import * as path from 'path';
import { dbConnectionConfig } from './database';

process.cwd();

let assetPath;
let assetPublicPath;

console.log('Default Config -> __dirname: ' + __dirname);

// for Docker
if (__dirname.startsWith('/srv/aw')) {
  assetPath = '/srv/aw/assets';
  assetPublicPath = '/srv/aw/public';
} else {
  assetPath = path.join(path.resolve(__dirname, '../', ...['assets']));

  assetPublicPath = path.join(path.resolve(__dirname, '../', ...['public']));
}

console.log('Default Config -> assetPath: ' + assetPath);
console.log('Default Config -> assetPublicPath: ' + assetPublicPath);

/**
 * The default configurations.
 */
export const defaultConfiguration: IConfig = {
  apiConfigOptions: {
    host: process.env.API_HOST || DEFAULT_API_HOST,
    port: process.env.API_PORT || DEFAULT_API_PORT,
    baseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
    middleware: [],
  },
  dbConnectionOptions: {
    ...dbConnectionConfig,
  },
  authOptions: {
    expressSessionSecret: process.env.EXPRESS_SESSION_SECRET || 'aw',
    userPasswordBcryptSaltRounds: 12,
    jwtSecret: process.env.JWT_SECRET || 'secretKey',
  },
  assetOptions: {
    assetPath: assetPath,
    assetPublicPath: assetPublicPath,
  },
};
