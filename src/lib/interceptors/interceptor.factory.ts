import { Interceptor, CachePlugin, NodeCacheInterceptor } from '.';
import { AxiosCachePluginConfig } from '../config';

const interceptorRegister = {
  [CachePlugin.NODE_CACHE + '']: (config: AxiosCachePluginConfig) =>
    new NodeCacheInterceptor().init(config),
};

export function getInterceptor(config: AxiosCachePluginConfig): Interceptor {
  return interceptorRegister[config.plugin ?? CachePlugin.NODE_CACHE](config);
}
