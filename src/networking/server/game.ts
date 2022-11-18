import { v4 as uuidv4 } from "uuid";

import { EnableRPCs, NetInfo, RPC, RPCPacket } from "../rpc.js";
import { WSClient } from "./client.js";
import { GameServer } from "./server.js";

interface GameData {
	id: string;
	name: string;
	host: string;
	players: string[];
	metadata: Record<string, any>;
}

@EnableRPCs("instance")
class Game {
	public id = uuidv4();
	public clients: WSClient[] = [];
	public metadata: Record<string, any> = {};
	private netInfo: NetInfo;

	constructor(private name: string, private host: WSClient, private server: GameServer) {
		console.log(`Game ${this} created by ${host.id}`);
	}

	public init() {
		console.log(`Setting up game ${this} to host ${this.host.id}`);
		this.handleNewClient(this.host);
	}

	public handleNewClient(client: WSClient) {
		console.log(`Client ${client.id} joined game ${this}`);
		client.gameId = this.id;
		this.clients.push(client);
		this.clientJoin(client.id);
		this.server.updateGamesList();
		client.joinGameResult(true);
	}

	public handleClientLeave(client: WSClient) {
		console.log(`Client ${client.id} left game ${this}`);
		this.clients = this.clients.filter((c) => c != client);
		if (client == this.host) this.close();
		this.clientLeave(client.id);
		this.server.updateGamesList();
	}

	public broadcastRPCs(rpcs: RPCPacket[], client: WSClient) {
		const message = JSON.stringify(rpcs);
		this.clients.forEach((c) => {
			if (c != client) c.send(message);
		});
	}

	public close() {
		console.log(`Game ${this} closed`);
		this.clients.forEach(client => client.gameId = null);
		this.gameClose();
		this.server.removeGame(this);
	}

	public toData(): GameData {
		return {
			id: this.id,
			name: this.name,
			host: this.host.id,
			players: this.clients.map((c) => c.id),
			metadata: this.metadata,
		};
	}

	toString() {
		return `${this.name} (${this.id}) (${this.clients.length} players)`;
	}

	@RPC("in")
	setMetadata(key: string, value: any) {
		const rpc = this.netInfo.lastPacket;
		const client = this.server.getClientById(rpc.callerId);
		if (client != this.host) {
			console.log(`Client ${rpc.callerId} tried to set metadata on game ${this.id} but is not the host`);
			return;
		}

		this.metadata[key] = value;
		this.server.updateGamesList();
	}

	@RPC("out")
	clientJoin(clientId: string) { }

	@RPC("out")
	clientLeave(clientId: string) { }

	@RPC("out")
	gameClose() { }
}

export { Game, GameData };