import { deepMerge, IConfig } from '../common';
import { defaultConfiguration } from './default-configuration';

let defaultConfig: IConfig = defaultConfiguration;

/**
 * Override the default config by merging in the provided values.
 *
 */
export function setConfig(providedConfig: Partial<IConfig>): void {
  defaultConfig = deepMerge(defaultConfig, providedConfig);
}


/**
 * Returns the app bootstrap config object.
 *
 */
export function getConfig(): Readonly<IConfig> {
  return defaultConfig;
}
