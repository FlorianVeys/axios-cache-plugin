import { Interceptor, InterceptorId, NodeCacheInterceptor } from '.';
import { AxiosCachePluginConfig } from '../config';

const interceptorRegister = {
  [InterceptorId.NODE_CACHE + '']: (config: AxiosCachePluginConfig) =>
    new NodeCacheInterceptor().init(config),
};

export function getInterceptor(config: AxiosCachePluginConfig): Interceptor {
  return interceptorRegister[config.interceptor ?? InterceptorId.NODE_CACHE](
    config
  );
}
