import { EventEmitter } from "../../utils/eventEmitter.js";
import { EnableRPCs, RPC } from "../rpc.js";
import { GameData } from "../server/game.js";
import { Game } from "./game.js";
import { NetworkManager } from "./networkManager.js";

@EnableRPCs("instance", ["WSClient"])
class Client extends EventEmitter<"game_list" | "join_game_result"> {
	public isJoiningGame = false;
	public connectedGame: Game | null = null;

	constructor(public id: string, private networkManager: NetworkManager) {
		super();
		console.log(`Setup `);
	}

	@RPC("in")
	ping() {
		this.pong();
	}

	@RPC("out")
	pong() { }

	@RPC("out")
	joinGame(gameId: string) {
		this.isJoiningGame = true;
		this.once("join_game_result", (success) => {
			if (success) {
				this.connectedGame = this.networkManager.getGameById(gameId);
				console.log(`Joined game ${this.connectedGame}`);
			}
		});
	}

	@RPC("in")
	joinGameResult(success: boolean) {
		console.log(`Join game result: ${success}`);
		this.isJoiningGame = false;
		this.emit("join_game_result", success);
	}

	@RPC("out")
	createGame(name: string) {
		this.once("join_game_result", (success) => {
			if (success) {
				this.connectedGame = this.networkManager.getGameByHostId(this.id);
				console.log(`Created game ${this.connectedGame}`);
			}
		});
	}

	@RPC("in")
	gameList(games: GameData[]) {
		this.emit("game_list", games);
	}
}

export { Client };