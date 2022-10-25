"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OscQueryService = void 0;
const ciao_1 = __importDefault(require("@homebridge/ciao"));
const events_1 = require("events");
const http = __importStar(require("http"));
const node_osc_1 = require("node-osc");
const handler_1 = __importDefault(require("./handler"));
const types_1 = require("./types");
class OscQueryService extends events_1.EventEmitter {
    constructor(name, oscQueryPort, oscPort) {
        super();
        this.oscQueryPort = oscQueryPort;
        this.oscPort = oscPort;
        this.nodes = [];
        this.name = name.replace(/\s/g, '-');
        this.responder = ciao_1.default.getResponder();
        this.startOscQueryService(oscQueryPort);
        this.advertiseOscService(oscPort);
        this.oscServer = new node_osc_1.Server(oscPort, '127.0.0.1', () => {
            this.emit('listening', 'osc');
        });
        this.oscServer.on('message', this.OnOscMessage.bind(this));
        this.httpServer = http.createServer((0, handler_1.default)(this));
        this.httpServer.listen(oscQueryPort, '127.0.0.1', () => {
            this.emit('listening', 'oscquery');
        });
    }
    startOscQueryService(port) {
        this.oscQueryService = this.responder.createService({
            name: this.name,
            type: 'oscjson',
            hostname: `${this.name}.oscjson.local`,
            port,
            protocol: "tcp" /* Protocol.TCP */,
            txt: { txtvers: '1' },
        });
        this.oscQueryService.advertise().then();
    }
    advertiseOscService(port) {
        this.oscService = this.responder.createService({
            name: this.name,
            type: 'osc',
            hostname: `${this.name}.osc.local`,
            port,
            protocol: "udp" /* Protocol.UDP */,
            txt: { txtvers: '1' },
        });
        this.oscService.advertise().then();
    }
    OnOscMessage(msg) {
        const node = this.nodes.find((n) => n.FULL_PATH === msg[0]);
        if (node && node.ACCESS === types_1.OscQueryAccess.READ_WRITE) {
            this.emit('valuechange', msg[0], node.VALUE, msg[1]);
            node.VALUE = msg[1];
        }
        this.emit('osc', msg[0], msg.slice(1));
    }
    getNode(path, value = true) {
        const nodes = this.getNodes(value);
        const parts = path.split('/').filter((p) => p !== '');
        let current = nodes;
        for (const part of parts) {
            if (current.CONTENTS) {
                current = current.CONTENTS[part];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    getNodes(value = true) {
        const result = { DESCRIPTION: 'root node', ACCESS: types_1.OscQueryAccess.NONE };
        for (const node of this.nodes) {
            if (!node.FULL_PATH)
                continue;
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
                            current.TYPE = types_1.OscQueryType.INT;
                        }
                        else {
                            current.TYPE = types_1.OscQueryType.FLOAT;
                        }
                        break;
                    case 'string':
                        current.TYPE = types_1.OscQueryType.STRING;
                        break;
                    case 'boolean':
                        current.TYPE = node.VALUE ? types_1.OscQueryType.TRUE : types_1.OscQueryType.FALSE;
                        break;
                    case 'undefined':
                        current.TYPE = types_1.OscQueryType.NIL;
                        break;
                    default:
                }
            }
            else {
                current.TYPE = node.TYPE;
            }
            if (value && typeof node.VALUE !== 'boolean' && node.ACCESS !== types_1.OscQueryAccess.NONE) {
                current.VALUE = node.VALUE;
            }
            if (current.CONTENTS !== undefined && Object.keys(current.CONTENTS).length < 1) {
                delete current.CONTENTS;
            }
        }
        return result;
    }
    addNode(node) {
        this.nodes.push(node);
    }
    dispose() {
        this.emit('close');
        this.removeAllListeners();
        this.oscQueryService?.destroy();
        this.oscService?.destroy();
        this.responder.shutdown();
        this.httpServer.close();
        this.oscServer.close();
    }
    getHostInfo() {
        return {
            NAME: this.name,
            EXTENSIONS: { ACCESS: true, CLIPMODE: false, RANGE: true, TYPE: true, VALUE: true },
            OSC_IP: '127.0.0.1',
            OSC_PORT: this.oscPort,
            OSC_TRANSPORT: 'UDP',
        };
    }
}
exports.OscQueryService = OscQueryService;
//# sourceMappingURL=service.js.map