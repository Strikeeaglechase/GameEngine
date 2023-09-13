/// <reference types="node" />
declare type RPCMode = "static" | "singleInstance" | "instance";
interface RPCHandler {
    type: RPCMode;
    target: string;
    name: string;
}
interface RPCPacket {
    className: string;
    method: string;
    args: any;
    id?: string;
    timestamp: number;
    callerId: string;
}
declare class NetInfo {
    lastPacket: RPCPacket;
    callerId: string;
    currentMethod: string;
    className: string;
    constructor(className: string);
    update(packet: RPCPacket): void;
    isLocal(): boolean;
    isRemote(): boolean;
    toString(): string;
}
declare type PermissionProvider = (packet: RPCPacket, rpc: RPCHandler, client: unknown) => boolean;
declare class RPCController {
    static instance: RPCController;
    private constructor();
    private newInRpcs;
    private rpcs;
    private sendHandler;
    private permissionProvider;
    private singleInstances;
    private instances;
    private multiNameLut;
    private rpcSendPool;
    static suppressRPCFindError: boolean;
    static init(sendHandler: (packet: RPCPacket[]) => void): void;
    static assignPermissionProvided(provider: PermissionProvider): void;
    registerRPCHandler<T extends {
        new (...args: any[]): {};
    }>(constructor: T, mode: RPCMode, altNames?: string[]): T;
    static deregister(instance: any): void;
    registerRpc(target: any, propertyKey: string, descriptor: PropertyDescriptor, direction: "in" | "out" | "bi"): PropertyDescriptor;
    private fireRPC;
    static flush(): void;
    static handlePacket(message: string | RPCPacket | Buffer | ArrayBuffer | Buffer[], client?: unknown): void;
    private static callMethod;
}
declare function EnableRPCs(mode?: RPCMode, altNames?: string[]): (constructor: any) => any;
declare type DecoratorReturn = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
declare function RPC(direction?: "in" | "out" | "bi"): DecoratorReturn;
export { RPCMode, RPCHandler, RPCPacket, RPCController, NetInfo, EnableRPCs, RPC };
