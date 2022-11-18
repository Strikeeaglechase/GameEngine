import { WebSocketServer } from "ws";
import { RPCController } from "../rpc.js";
import { WSClient } from "./client.js";
import { Game } from "./game.js";
const clientClass = "WSClient";
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
        RPCController.init((packets) => {
            const clientPackets = packets.filter(packet => packet.className == clientClass);
            const broadcastPackets = packets.filter(packet => packet.className != clientClass);
            this.clients.forEach(c => c.send(broadcastPackets));
            clientPackets.forEach(packet => {
                const client = this.getClientById(packet.id);
                if (client)
                    client.send(packet);
            });
        });
        setInterval(() => {
            RPCController.flush();
        }, 1000 / 60);
        // setInterval(() => {
        // 	this.clients.forEach(c => {
        // 		console.log({ client: c.id, game: c.gameId, host: c.isHost });
        // 	});
        // }, 2500);
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
        this.updateGamesList();
        game.init();
        return game;
    }
    removeGame(game) {
        game.clients.forEach(client => client.gameId = null);
        this.games = this.games.filter((g) => g != game);
    }
    updateGamesList(client) {
        const games = this.games.map((g) => g.toData());
        if (client) {
            client.gameList(games);
        }
        else {
            this.clients.forEach((c) => c.gameList(games));
        }
    }
}
export { GameServer };
