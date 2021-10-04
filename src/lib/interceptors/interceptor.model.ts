import { AxiosRequestConfig, AxiosResponse } from '../../infrastructure/axios';
import { AxiosCachePluginConfig } from '../config';

export abstract class Interceptor {
  abstract id: InterceptorId;

  abstract init(config: AxiosCachePluginConfig): this;
  abstract requestInterceptor(request: AxiosRequestConfig): any;
  abstract responseInterceptor(response: AxiosResponse): any;
}

export enum InterceptorId {
  NODE_CACHE = 'NODE_CACHE',
}
