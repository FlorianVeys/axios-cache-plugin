import { Axios, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosCachePluginConfig } from '..';
import { getInterceptor } from './interceptors';

export function setup(axios: Axios, config: AxiosCachePluginConfig) {
  const interceptor = getInterceptor(config);

  axios.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    return interceptor.requestInterceptor(request);
  });

  axios.interceptors.response.use((response: AxiosResponse) => {
    return interceptor.responseInterceptor(response);
  });
}
