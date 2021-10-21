import { AxiosRequestConfig, AxiosResponse, hash } from '../../infrastructure';
import { AxiosPluginHeader, CacheValue } from '../cache.model';
import { AxiosCachePluginConfig } from '../config';

export abstract class Interceptor {
  abstract id: InterceptorId;

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
    const request = response.request as AxiosRequestConfig;
    if (!request) {
      return false;
    }

    if (request.method !== 'GET') {
      return false;
    }

    return true;
  }

  abstract init(config: AxiosCachePluginConfig): this;
  abstract requestInterceptor(request: AxiosRequestConfig): any;
  abstract responseInterceptor(response: AxiosResponse): any;
}

export enum InterceptorId {
  NODE_CACHE = 'NODE_CACHE',
}
