export interface FileStorageOption {
  dest: string | CallableFunction;
  provider?: FileStorageProviderEnum;
  prefix?: string;
  filename?: string | CallableFunction;
}

export interface FileSystem {
  rootPath: string;
  baseUrl?: string;
}

export enum FileStorageProviderEnum {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  CLOUDINARY = 'CLOUDINARY',
}

export interface UploadedFile {
  fieldName: string;
  key: string; // path of the file in storage
  originalName: string; // original file name
  size: number; // files in bytes
  encoding?: string;
  mimetype?: string;
  filename: string;
  url: string; // file public url
  path: string; // Full path of the file
}

export interface IS3FileStorageProviderConfig {
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_default_region?: string;
  aws_bucket?: string;
}

export interface ICloudinaryFileStorageProviderConfig {
  cloudinary_cloud_name?: string;
  cloudinary_api_key?: string;
  cloudinary_api_secret?: string;
}
