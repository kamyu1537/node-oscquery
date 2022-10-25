import * as http from 'http';
import { OscQueryService } from './service';

export default (service: OscQueryService) => {
  return (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, url } = req;
    if (method !== 'GET') {
      res.writeHead(405);
      res.write('Method Not Allowed');
      res.end();
      return;
    }

    const { pathname, searchParams } = new URL(`http://${req.headers.host}${url}`);

    if (searchParams.has('HOST_INFO')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(service.getHostInfo()));
      res.end();
      return;
    }

    if (pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(service.getNodes(true)));
      res.end();
      return;
    } else {
      const node = service.getNode(pathname);
      if (node) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(service.getNode(pathname)));
        res.end();
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('OSC Path not found');
    res.end();
  };
};
