import { AxiosRequestConfig, AxiosResponse } from '../../infrastructure/axios';
import { AxiosCachePluginConfig } from '../config';
import { Interceptor, InterceptorId } from '.';
import NodeCache from 'node-cache';

export class NodeCacheInterceptor extends Interceptor {
  id = InterceptorId.NODE_CACHE;

  private nodeCache?: NodeCache;

  init(config: AxiosCachePluginConfig) {
    this.nodeCache = new NodeCache(config.pluginConfig);

    return this;
  }

  requestInterceptor(request: AxiosRequestConfig): any {
    return request;
  }
  responseInterceptor(response: AxiosResponse): any {
    return response;
  }
}
