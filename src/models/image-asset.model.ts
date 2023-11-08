import { IBaseEntityModel } from './base-entity.model';
import { FileStorageProviderEnum } from './file-provider';

export interface IRelationalImageAsset {
  image?: IImageAsset | null;
  imageId?: IImageAsset['id'] | null;
}

export interface IImageAsset extends IImageAssetCreateInput {
  fullUrl?: string;
  thumbUrl?: string;
}

export interface IImageAssetFindInput
  extends IBaseEntityModel,
    Pick<IImageAsset, 'isFeatured'> {}

export interface IImageAssetUploadInput extends IBaseEntityModel {}

export interface IImageAssetCreateInput extends IBaseEntityModel {
  name: string;
  url: string;
  thumb?: string;
  width?: number;
  height?: number;
  size?: number;
  isFeatured?: boolean;
  externalProviderId?: string;
  storageProvider?: FileStorageProviderEnum;
}
