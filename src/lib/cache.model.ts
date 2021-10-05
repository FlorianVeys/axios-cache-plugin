import { AxiosResponse } from '../infrastructure';

export type CacheValue = Omit<AxiosResponse, 'config' | 'request'>;

export namespace AxiosPluginHeader {
  export const CACHE_HIT_HEADER = 'axios-cache-hit';
  export const CACHE_CONTENT_HEADER = 'axios-cache-plugin-result';
}
