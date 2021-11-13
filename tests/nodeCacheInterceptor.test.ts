import { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { AxiosCachePluginConfig, setup } from '../src';
import { InterceptorId } from '../src/lib/interceptors';
import { createHttpServer, sleep } from './test.helpers';

function getConfig(
  base?: Partial<AxiosCachePluginConfig>
): AxiosCachePluginConfig {
  return {
    interceptor: InterceptorId.NODE_CACHE,
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

  it("shouldn't cache post request by default without cache header", async () => {
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

  it('should call twice same route if ttl expired', async () => {
    server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      callstack++;
      res.end('hello');
    });
    // 5ms of ttl
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
    // 5ms of ttl
    const config = getConfig();

    axios.interceptors.request.use((request: AxiosRequestConfig) => {
      console.log('Custom request interceptor set !');
      return request;
    });

    axios.interceptors.response.use((response: AxiosResponse) => {
      console.log('Custom response interceptor set !');
      return response;
    });

    setup(axios, config);

    await axios.get('toto');

    expect(callstack).toEqual(1);
  });
});
