import { IEnvironment } from './IEnvironment';
import { FileStorageProviderEnum } from '../../models';

export const environment: IEnvironment = {
  port: process.env.API_PORT || 3000,
  host: process.env.API_HOST || 'http://localhost',
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:4200',
  production: true,
  envName: 'prod',

  env: {
    LOG_LEVEL: 'debug',
  },

  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET || 'aw',
  USER_PASSWORD_BCRYPT_SALT_ROUNDS: 12,

  JWT_SECRET: process.env.JWT_SECRET || 'secretKey',
  JWT_TOKEN_EXPIRATION_TIME:
    parseInt(process.env.JWT_TOKEN_EXPIRATION_TIME) || 86400 * 1, // default JWT token expire time (1 day)

  JWT_REFRESH_TOKEN_SECRET:
    process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecretKey',
  JWT_REFRESH_TOKEN_EXPIRATION_TIME:
    parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME) || 86400 * 7, // default JWT refresh token expire time (7 days)

  /**
   * Email verification options
   */
  JWT_VERIFICATION_TOKEN_SECRET:
    process.env.JWT_VERIFICATION_TOKEN_SECRET || 'verificationSecretKey',
  JWT_VERIFICATION_TOKEN_EXPIRATION_TIME:
    parseInt(process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME) || 86400 * 7, // default verification expire token time (7 days)

  /**
   * Email Reset
   */
  EMAIL_RESET_EXPIRATION_TIME:
    parseInt(process.env.EMAIL_RESET_EXPIRATION_TIME) || 1800, // default email reset expiration time (30 minutes)

  /**
   * Throttler (Rate Limiting) Options
   */
  THROTTLE_TTL: parseInt(process.env.THROTTLE_TTL) || 60,
  THROTTLE_LIMIT: parseInt(process.env.THROTTLE_LIMIT) || 300,

  fileSystem: {
    name:
      (process.env.FILE_PROVIDER as FileStorageProviderEnum) ||
      FileStorageProviderEnum.LOCAL,
  },

  awsConfig: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'gauzy',
    },
  },

  /**
   * Cloudinary FileSystem Storage Configuration
   */
  cloudinaryConfig: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: process.env.CLOUDINARY_API_SECURE === 'false' ? false : true,
    delivery_url:
      process.env.CLOUDINARY_CDN_URL || `https://res.cloudinary.com`,
  },

  googleConfig: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_BASE_URL}/api/auth/google/callback`,
  },

  smtpConfig: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: process.env.MAIL_PORT === '465' ? true : false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    fromAddress: process.env.MAIL_FROM_ADDRESS,
  },

  /**
   * Email Template Config
   */
  appIntegrationConfig: {
    appName: process.env.APP_NAME || 'AW',
    appLogo:
      process.env.APP_LOGO ||
      `${process.env.CLIENT_BASE_URL}/assets/images/logos/logo.png`,
    appSignature: process.env.APP_SIGNATURE || 'AW Team',
    appLink: process.env.APP_LINK || 'http://localhost:4200/',
    appEmailConfirmationUrl:
      process.env.APP_EMAIL_CONFIRMATION_URL ||
      'http://localhost:4200/#/auth/confirm-email',
  },
};
