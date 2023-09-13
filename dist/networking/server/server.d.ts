import { WSClient } from "./client.js";
import { Game } from "./game.js";
declare class GameServer {
    private port;
    private wss;
    private clients;
    private games;
    constructor(port: number);
    init(): void;
    private setupNewConnection;
    removeClient(client: WSClient): void;
    getClientById(id: string): WSClient;
    getGameById(id: string): Game;
    createGame(name: string, host: WSClient): Game;
    removeGame(game: Game): void;
    updateGamesList(client?: WSClient): void;
}
export { GameServer };
