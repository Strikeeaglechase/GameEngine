import { WebSocketServer } from "ws";
import { WSClient } from "./client.js";
import { Game } from "./game.js";
class GameServer {
    constructor(port) {
        this.port = port;
        this.clients = [];
        this.games = [];
    }
    init() {
        this.wss = new WebSocketServer({ port: this.port });
        this.wss.on("connection", (ws) => this.setupNewConnection(ws));
        this.wss.on("listening", () => {
            console.log(`Game server listening on port ${this.port}`);
        });
    }
    setupNewConnection(ws) {
        const client = new WSClient(ws, this);
        this.clients.push(client);
        client.init();
    }
    removeClient(client) {
        this.clients = this.clients.filter((c) => c != client);
    }
    getClientById(id) {
        return this.clients.find((c) => c.id == id);
    }
    getGameById(id) {
        return this.games.find((g) => g.id == id);
    }
    createGame(name, host) {
        const game = new Game(name, host, this);
        this.games.push(game);
        return game;
    }
    removeGame(game) {
        game.clients.forEach(client => client.gameId = null);
        this.games = this.games.filter((g) => g != game);
    }
    updateGamesList() {
        const games = this.games.map((g) => g.toData());
        this.clients.forEach((c) => c.gameList(games));
    }
}
export { GameServer };
