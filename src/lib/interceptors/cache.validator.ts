import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export class CacheValidator {
  private statusAllowed = [301, 302, 307, 308, 410];

  private exist(response: AxiosResponse): boolean {
    return !!response;
  }

  private isMethodAllowed(
    request: InternalAxiosRequestConfig,
    methodAllowed = ['GET']
  ): boolean {
    return methodAllowed.includes(request.method ?? '');
  }

  private isStatusCodeAllowed(response: AxiosResponse): boolean {
    if (
      (response.status > 199 && response.status < 300) ||
      this.statusAllowed.includes(response.status)
    ) {
      return true;
    }
    return false;
  }

  isResponseCacheable(
    response: AxiosResponse,
    methodAllowed?: string[]
  ): boolean {
    const request = response.request as InternalAxiosRequestConfig;
    if (!request) {
      return false;
    }

    return (
      this.exist(response) &&
      this.isMethodAllowed(request, methodAllowed) &&
      this.isStatusCodeAllowed(response)
    );
  }
}
