import { RPCPacket } from "../rpc.js";
import { WSClient } from "./client.js";
import { GameServer } from "./server.js";
interface GameData {
    id: string;
    name: string;
    host: string;
    players: string[];
    metadata: Record<string, any>;
}
declare class Game {
    private name;
    private host;
    private server;
    id: string;
    clients: WSClient[];
    metadata: Record<string, any>;
    private netInfo;
    constructor(name: string, host: WSClient, server: GameServer);
    init(): void;
    handleNewClient(client: WSClient): void;
    handleClientLeave(client: WSClient): void;
    broadcastRPCs(rpcs: RPCPacket[], client: WSClient): void;
    close(): void;
    toData(): GameData;
    toString(): string;
    setMetadata(key: string, value: any): void;
    clientJoin(clientId: string): void;
    clientLeave(clientId: string): void;
    gameClose(): void;
}
export { Game, GameData };
