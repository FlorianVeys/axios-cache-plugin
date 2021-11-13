import { AxiosRequestConfig, AxiosResponse } from '../../infrastructure';
import { AxiosCachePluginConfig } from '../config';
import { Interceptor, InterceptorId } from '.';
import NodeCache from 'node-cache';
import { CacheValue, AxiosPluginHeader } from '../cache.model';

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

  get(key: string): CacheValue | undefined {
    if (!this.nodeCache) {
      throw new Error('Issue in cache initializer');
    }
    return this.nodeCache.get<CacheValue>(key);
  }

  set(key: string, content: CacheValue): void {
    if (!this.nodeCache) {
      throw new Error('Issue in cache initializer');
    }
    this.nodeCache.set(key, content);
  }
}
