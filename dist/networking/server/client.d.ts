import WebSocket from "ws";
import { GameData } from "./game.js";
import { GameServer } from "./server.js";
declare class WSClient {
    private socket;
    private server;
    isAlive: boolean;
    id: string;
    gameId: string | null;
    isHost: boolean;
    private lastPing;
    constructor(socket: WebSocket, server: GameServer);
    init(): void;
    private onMessage;
    private onClose;
    send(message: any): void;
    private pingLoop;
    private maybeLeaveCurrentGame;
    toString(): string;
    ping(): void;
    pong(): void;
    joinGame(gameId: string): void;
    joinGameResult(success: boolean): void;
    createGame(name: string): void;
    gameList(games: GameData[]): void;
}
export { WSClient };
