import { EventEmitter } from "../../utils/eventEmitter.js";
import { EnableRPCs, RPC } from "../rpc.js";
import { GameData } from "../server/game.js";

@EnableRPCs("instance")
class Game extends EventEmitter<"client_join" | "client_leave" | "game_close"> {
	public isOpen = true;
	public metadata: Record<string, any> = {};
	public players: Set<string> = new Set();
	public host: string;
	public name: string;

	constructor(public id: string) {
		super();
	}

	updateFromData(data: GameData) {
		this.metadata = data.metadata;
		this.players = new Set(data.players);
		this.host = data.host;
		this.name = data.name;
	}

	@RPC("out")
	setMetadata(key: string, value: any) {
		this.metadata[key] = value;
	}

	@RPC("in")
	clientJoin(clientId: string) {
		this.emit("client_join", clientId);
		this.players.add(clientId);
	}

	@RPC("in")
	clientLeave(clientId: string) {
		this.emit("client_leave", clientId);
		this.players.delete(clientId);
	}

	@RPC("in")
	gameClose() {
		this.emit("game_close");
	}

	toString() {
		return `${this.name} (${this.id}) (${this.players.size} players)`;
	}
}

export { Game };