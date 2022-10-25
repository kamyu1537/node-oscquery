/// <reference types="node" />
import { EventEmitter } from 'events';
import { IDisposable, OscQueryNode, OscQueryServiceEvents } from './types';
export declare class OscQueryService extends EventEmitter implements IDisposable, OscQueryServiceEvents {
    readonly oscQueryPort: number;
    readonly oscPort: number;
    readonly name: string;
    private responder;
    private oscQueryService;
    private oscService;
    private httpServer;
    private oscServer;
    private nodes;
    constructor(name: string, oscQueryPort: number, oscPort: number);
    private startOscQueryService;
    private advertiseOscService;
    private OnOscMessage;
    getNode(path: string, value?: boolean): OscQueryNode | undefined;
    getNodes(value?: boolean): OscQueryNode;
    addNode(node: OscQueryNode): void;
    dispose(): void;
    getHostInfo(): {
        NAME: string;
        EXTENSIONS: {
            ACCESS: boolean;
            CLIPMODE: boolean;
            RANGE: boolean;
            TYPE: boolean;
            VALUE: boolean;
        };
        OSC_IP: string;
        OSC_PORT: number;
        OSC_TRANSPORT: string;
    };
}
//# sourceMappingURL=service.d.ts.map