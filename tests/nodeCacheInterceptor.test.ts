import { Axios } from 'axios';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { AxiosCachePluginConfig, setup } from '../src';
import { InterceptorId } from '../src/lib/interceptors';
import { createHttpServer } from './test.helpers';

function getConfig(
  base?: Partial<AxiosCachePluginConfig>
): AxiosCachePluginConfig {
  return {
    ...base,
    interceptor: InterceptorId.NODE_CACHE,
    defaultTtl: 300,
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

  // TODO Add test to ensure that no new cache key is set if cache response previously retrieve
});
