import { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { AxiosCachePluginConfig, setup } from '../src';
import { CachePlugin } from '../src/lib/interceptors';
import { createHttpServer, sleep } from './test.helpers';

function getConfig(
  base?: Partial<AxiosCachePluginConfig>
): AxiosCachePluginConfig {
  return {
    plugin: CachePlugin.NODE_CACHE,
    defaultTtl: 300,
    ...base,
  } as AxiosCachePluginConfig;
}

describe('Node cache interceptor', () => {
  let axios: Axios;
  let server: Server;
  let callstack: number;

  beforeEach(() => {
    callstack = 0;

    axios = new Axios({
      baseURL: 'http://localhost:3000',
    });
  });

  afterEach(() => {
    server?.close();
    callstack = 0;
  });

  it('should call simple get function only once', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;
      res.end('hello');
    });
    const config = getConfig();

    setup(axios, config);

    await axios.get('toto');
    await axios.get('toto');

    expect(callstack).toEqual(1);
  });

  it('should call get function only once with json response', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    const response1 = await axios.get('toto');
    const response2 = await axios.get('toto');

    expect(callstack).toEqual(1);
    expect(response1.data).toEqual(response2.data);
    expect(response1.status).toEqual(response2.status);
    expect(response1.statusText).toEqual(response2.statusText);
  });

  it('should call method twice as get calls different', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.get('toto');
    await axios.get('toto2');

    expect(callstack).toEqual(2);
  });

  it('should not cache as query parameter different', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.get('toto');
    await axios.get('toto?clientId=2');

    expect(callstack).toEqual(2);
  });

  it("shouldn't cache POST request by default", async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.post('toto');
    await axios.post('toto');

    expect(callstack).toEqual(2);
  });

  it("shouldn't cache DELETE request by default", async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.delete('toto');
    await axios.delete('toto');

    expect(callstack).toEqual(2);
  });

  it("shouldn't cache PUT request by default", async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.put('toto');
    await axios.put('toto');

    expect(callstack).toEqual(2);
  });

  it("shouldn't cache PATCH request by default", async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.patch('toto');
    await axios.patch('toto');

    expect(callstack).toEqual(2);
  });

  it("shouldn't cache HEAD request by default", async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ a: 1 }));
    });
    const config = getConfig();

    setup(axios, config);

    await axios.head('toto');
    await axios.head('toto');

    expect(callstack).toEqual(2);
  });

  it('should call twice same route if ttl expired', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;
      res.end('hello');
    });
    // 1 second of ttl
    const config = getConfig({
      defaultTtl: 1,
    });

    setup(axios, config);

    await axios.get('toto');
    await sleep(1500);
    await axios.get('toto');

    expect(callstack).toEqual(2);
  });

  it('should not interact with custom client interceptor', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;
      res.end('hello');
    });
    let requestInterceptorCounter = 0;
    let responseInterceptorCounter = 0;

    const config = getConfig();

    axios.interceptors.request.use((request: AxiosRequestConfig) => {
      requestInterceptorCounter++;
      return request;
    });

    axios.interceptors.response.use((response: AxiosResponse) => {
      responseInterceptorCounter++;
      return response;
    });

    setup(axios, config);

    await axios.get('toto');

    await axios.get('toto');

    expect(callstack).toEqual(1);
    expect(requestInterceptorCounter).toEqual(2);
    expect(responseInterceptorCounter).toEqual(2);
  });
});
