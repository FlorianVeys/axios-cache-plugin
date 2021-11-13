import { CacheValidator } from '.';
import { AxiosRequestConfig, AxiosResponse, hash } from '../../infrastructure';
import { AxiosPluginHeader, CacheValue } from '../cache.model';
import { AxiosCachePluginConfig } from '../config';

export abstract class Interceptor {
  private cacheValidator: CacheValidator;

  constructor() {
    this.cacheValidator = new CacheValidator();
  }

  abstract id: CachePlugin;
  abstract init(config: AxiosCachePluginConfig): this;
  abstract set(key: string, content: CacheValue): void;
  abstract get(key: string): CacheValue | undefined;

  protected getKey(request: AxiosRequestConfig): string {
    return `${request?.method ?? ''}-${hash(request?.url)}-${hash(
      JSON.stringify(request?.params)
    )}-${hash(JSON.stringify(request?.data))}`;
  }

  protected constructCacheContent(response: AxiosResponse): CacheValue {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  protected constructAxiosResponse(
    cacheContent: CacheValue,
    request: AxiosRequestConfig
  ): AxiosResponse<any> {
    return {
      data: cacheContent.data,
      status: cacheContent.status,
      statusText: cacheContent.statusText,
      headers: {
        ...cacheContent.headers,
        [AxiosPluginHeader.CACHE_HIT_HEADER]: 'true',
      },
      config: request,
    };
  }

  protected isCacheAllowed(response: AxiosResponse): boolean {
    return this.cacheValidator.isResponseCacheable(response);
  }

  requestInterceptor(request: AxiosRequestConfig): any {
    const key = this.getKey(request);
    const cacheContent = this.get(key);

    if (cacheContent) {
      const response = this.constructAxiosResponse(cacheContent, request);
      // Fake api call and return cache content provide by header
      request.adapter = (config: AxiosRequestConfig) => {
        return new Promise((resolve, reject) => {
          if (
            config?.headers &&
            config?.headers[AxiosPluginHeader.CACHE_CONTENT_HEADER]
          ) {
            return resolve(
              JSON.parse(config.headers[AxiosPluginHeader.CACHE_CONTENT_HEADER])
            );
          }
          return reject('Unable to load local datas');
        });
      };
      request.headers = {
        [AxiosPluginHeader.CACHE_CONTENT_HEADER]: JSON.stringify(response),
        ...request.headers,
      };
    }

    return request;
  }

  responseInterceptor(response: AxiosResponse): any {
    // Avoid storing new cache content if response come from cache
    if (this.isCacheAllowed(response)) {
      if (!response?.headers[AxiosPluginHeader.CACHE_HIT_HEADER]) {
        const key = this.getKey(response?.config);
        this.set(key, this.constructCacheContent(response));
      }
    }

    return response;
  }
}

export enum CachePlugin {
  NODE_CACHE = 'NODE_CACHE',
}
