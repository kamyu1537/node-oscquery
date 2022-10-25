import ciao, { CiaoService, Protocol, Responder } from '@homebridge/ciao';
import { EventEmitter } from 'events';
import * as http from 'http';
import { Server as OscServer } from 'node-osc';
import ServerHandler from './handler';
import { ArgumentType, IDisposable, OscQueryAccess, OscQueryNode, OscQueryServiceEvents, OscQueryType } from './types';

export class OscQueryService extends EventEmitter implements IDisposable, OscQueryServiceEvents {
  public readonly name: string;

  private responder: Responder;
  private oscQueryService: CiaoService | undefined;
  private oscService: CiaoService | undefined;

  private httpServer: http.Server;
  private oscServer: OscServer;

  private nodes: OscQueryNode[] = [];

  constructor(name: string, public readonly oscQueryPort: number, public readonly oscPort: number) {
    super();

    this.name = name.replace(/\s/g, '-');
    this.responder = ciao.getResponder();

    this.startOscQueryService(oscQueryPort);
    this.advertiseOscService(oscPort);

    this.oscServer = new OscServer(oscPort, '127.0.0.1', () => {
      this.emit('listening', 'osc');
    });
    this.oscServer.on('message', this.OnOscMessage.bind(this));

    this.httpServer = http.createServer(ServerHandler(this));
    this.httpServer.listen(oscQueryPort, '127.0.0.1', () => {
      this.emit('listening', 'oscquery');
    });
  }

  private startOscQueryService(port: number) {
    this.oscQueryService = this.responder.createService({
      name: this.name,
      type: 'oscjson',
      hostname: `${this.name}.oscjson.local`,
      port,
      protocol: Protocol.TCP,
      txt: { txtvers: '1' },
    });
    this.oscQueryService.advertise().then();
  }

  private advertiseOscService(port: number) {
    this.oscService = this.responder.createService({
      name: this.name,
      type: 'osc',
      hostname: `${this.name}.osc.local`,
      port,
      protocol: Protocol.UDP,
      txt: { txtvers: '1' },
    });
    this.oscService.advertise().then();
  }

  private OnOscMessage(msg: [string, ...ArgumentType[]]) {
    const node = this.nodes.find((n) => n.FULL_PATH === msg[0]);
    if (node && node.ACCESS === OscQueryAccess.READ_WRITE) {
      this.emit('valuechange', msg[0], node.VALUE, msg[1]);
      node.VALUE = msg[1];
    }

    this.emit('osc', msg[0], msg.slice(1));
  }

  public getNode(path: string, value = true) {
    const nodes = this.getNodes(value);
    const parts = path.split('/').filter((p) => p !== '');

    let current = nodes;
    for (const part of parts) {
      if (current.CONTENTS) {
        current = current.CONTENTS[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  public getNodes(value = true) {
    const result: OscQueryNode = { DESCRIPTION: 'root node', ACCESS: OscQueryAccess.NONE };

    for (const node of this.nodes) {
      if (!node.FULL_PATH) continue;

      const parts = node.FULL_PATH.split('/').filter((p) => p !== '');

      let fullPath = '';
      let current = result;

      for (const part of parts) {
        fullPath += `/${part}`;

        const contents = current.CONTENTS || {};
        current.CONTENTS = contents;

        contents[part] = contents[part] || { FULL_PATH: fullPath, CONTENTS: {} };
        current = contents[part];
      }

      current.ACCESS = node.ACCESS;
      current.DESCRIPTION = node.DESCRIPTION || '';
      current.TYPE = node.TYPE;

      if (node.TYPE === undefined || typeof node.VALUE === 'boolean') {
        switch (typeof node.VALUE) {
          case 'number':
            if (Number.isInteger(node.VALUE)) {
              current.TYPE = OscQueryType.INT;
            } else {
              current.TYPE = OscQueryType.FLOAT;
            }
            break;
          case 'string':
            current.TYPE = OscQueryType.STRING;
            break;
          case 'boolean':
            current.TYPE = node.VALUE ? OscQueryType.TRUE : OscQueryType.FALSE;
            break;
          case 'undefined':
            current.TYPE = OscQueryType.NIL;
            break;
          default:
        }
      } else {
        current.TYPE = node.TYPE;
      }

      if (value && typeof node.VALUE !== 'boolean' && node.ACCESS !== OscQueryAccess.NONE) {
        current.VALUE = node.VALUE;
      }

      if (current.CONTENTS !== undefined && Object.keys(current.CONTENTS).length < 1) {
        delete current.CONTENTS;
      }
    }

    return result;
  }

  public addNode(node: OscQueryNode) {
    this.nodes.push(node);
  }

  public dispose() {
    this.emit('close');
    this.removeAllListeners();

    this.oscQueryService?.destroy();
    this.oscService?.destroy();
    this.responder.shutdown();

    this.httpServer.close();
    this.oscServer.close();
  }

  public getHostInfo() {
    return {
      NAME: this.name,
      EXTENSIONS: { ACCESS: true, CLIPMODE: false, RANGE: true, TYPE: true, VALUE: true },
      OSC_IP: '127.0.0.1',
      OSC_PORT: this.oscPort,
      OSC_TRANSPORT: 'UDP',
    };
  }
}
