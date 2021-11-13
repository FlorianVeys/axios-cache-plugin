import { createServer, RequestListener, Server } from 'http';

export function createHttpServer(listener: RequestListener): Server {
  const server = createServer(listener);
  server.listen(3000);

  return server;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
