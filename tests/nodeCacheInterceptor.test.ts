import { Axios } from 'axios';
import http, { Server } from 'http';
import { AxiosCachePluginConfig, setup } from '../src';
import { InterceptorId } from '../src/lib/interceptors';

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
    const requestListener = function (req: any, res: any) {
      callstack++;
      res.writeHead(200);
      res.end('hello');
    };

    server = http.createServer(requestListener);
    server.listen(3000);

    axios = new Axios({
      baseURL: 'http://localhost:3000',
    });
  });

  afterEach(() => {
    server.close();
    callstack = 0;
  });

  it('should not call get function only once', async () => {
    const config = getConfig();

    setup(axios, config);

    await axios.get('toto');
    await axios.get('toto');

    expect(callstack).toEqual(1);
  });

  // TODO Add test to ensure that no new cache key is set if cache response previously retrieve
});
