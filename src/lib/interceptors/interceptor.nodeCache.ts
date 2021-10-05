import { AxiosRequestConfig, AxiosResponse } from '../../infrastructure';
import { AxiosCachePluginConfig } from '../config';
import { Interceptor, InterceptorId } from '.';
import NodeCache from 'node-cache';
import { CacheValue } from '../cache.model';

export class NodeCacheInterceptor extends Interceptor {
  id = InterceptorId.NODE_CACHE;

  private nodeCache?: NodeCache;

  init(config: AxiosCachePluginConfig) {
    this.nodeCache = new NodeCache({
      stdTTL: config.defaultTtl,
      ...config.pluginConfig,
    });

    return this;
  }

  requestInterceptor(request: AxiosRequestConfig): any {
    const key = this.getKey(request);
    const cacheContent = this.nodeCache?.get<CacheValue>(key);

    if (cacheContent) {
      const response = this.constructAxiosResponse(cacheContent, request);
      // Fake api call and return cache content provide by header
      request.adapter = (config: AxiosRequestConfig) => {
        return new Promise((resolve, reject) => {
          if (config?.headers && config?.headers['axios-cache-plugin-result']) {
            return resolve(
              JSON.parse(config.headers['axios-cache-plugin-result'])
            );
          }
          return reject('Unable to load local datas');
        });
      };
      request.headers = {
        'axios-cache-plugin-result': JSON.stringify(response),
        ...request.headers,
      };
    }

    return request;
  }
  responseInterceptor(response: AxiosResponse): any {
    const key = this.getKey(response?.config);
    this.nodeCache?.set(key, this.constructCacheContent(response));

    return response;
  }
}
