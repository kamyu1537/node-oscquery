import type { ArgumentType as OscArgumentType } from 'node-osc';
export interface IDisposable {
    dispose(): void;
}
export declare enum OscQueryType {
    INT = "i",
    FLOAT = "f",
    STRING = "s",
    BLOB = "b",
    TRUE = "T",
    FALSE = "F",
    NIL = "N"
}
export declare enum OscQueryAccess {
    NONE = 0,
    READ_ONLY = 1,
    READ_WRITE = 2
}
export interface OscQueryNode {
    FULL_PATH?: string;
    TYPE?: OscQueryType;
    CONTENTS?: OscQueryNodeMap;
    ACCESS?: OscQueryAccess;
    VALUE?: unknown;
    DESCRIPTION?: string;
}
export declare type OscQueryNodeMap = Record<string, OscQueryNode>;
export declare type ArgumentType = OscArgumentType;
export interface OscQueryServiceEvents {
    on(event: 'listening', listener: (service: string) => void): this;
    on(event: 'osc', listener: (path: string, args: ArgumentType[]) => void): this;
    on(event: 'valuechange', listener: (path: string, oldValue: unknown, newValue: unknown) => void): this;
    on(event: 'close', listener: () => void): this;
}
//# sourceMappingURL=types.d.ts.map