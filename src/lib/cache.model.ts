import { AxiosResponse } from '../infrastructure';

export type CacheValue = Omit<AxiosResponse, 'config' | 'request'>;
