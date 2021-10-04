import { InterceptorId } from './interceptors';

export interface AxiosCachePluginConfig {
  defaultTtl: number;
  interceptor?: InterceptorId;
  pluginConfig?: any;
}
