import { CachePlugin } from './interceptors';

export interface AxiosCachePluginConfig {
  /**
   * Default time to live in seconds in cache
   */
  defaultTtl: number;
  /**
   * Plugin used for caching data
   * @argument 'NODE_CACHE'
   */
  plugin?: CachePlugin;
  /**
   * Custom configuration for the plugin choosed (see documentation of the plugin used)
   */
  pluginConfig?: any;
}
