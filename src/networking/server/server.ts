import { WebSocket, WebSocketServer } from "ws";

import { RPCController } from "../rpc.js";
import { WSClient } from "./client.js";
import { Game } from "./game.js";

const clientClass = "WSClient";

class GameServer {
	private wss: WebSocketServer;
	private clients: WSClient[] = [];
	private games: Game[] = [];

	constructor(private port: number) { }

	public init() {
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
				if (client) client.send(packet);
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

	private setupNewConnection(ws: WebSocket) {
		const client = new WSClient(ws, this);
		this.clients.push(client);
		client.init();
	}

	public removeClient(client: WSClient) {
		this.clients = this.clients.filter((c) => c != client);
	}

	public getClientById(id: string) {
		return this.clients.find((c) => c.id == id);
	}

	public getGameById(id: string) {
		return this.games.find((g) => g.id == id);
	}

	public createGame(name: string, host: WSClient) {
		const game = new Game(name, host, this);
		this.games.push(game);
		this.updateGamesList();
		game.init();
		return game;
	}

	public removeGame(game: Game) {
		game.clients.forEach(client => client.gameId = null);
		this.games = this.games.filter((g) => g != game);
	}

	public updateGamesList(client?: WSClient) {
		const games = this.games.map((g) => g.toData());
		if (client) {
			client.gameList(games);
		} else {
			this.clients.forEach((c) => c.gameList(games));
		}
	}
}

export { GameServer };