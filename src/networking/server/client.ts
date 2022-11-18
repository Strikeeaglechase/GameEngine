import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

import { EnableRPCs, RPC, RPCController, RPCPacket } from "../rpc.js";
import { GameData } from "./game.js";
import { GameServer } from "./server.js";

const PING_RATE = 5000;
const broadcastIgnore: { className: string, method: string; }[] = [
	{ className: "WSClient", method: "pong" },
	{ className: "WSClient", method: "joinGame" },
];

@EnableRPCs("instance", ["Client"])
class WSClient {
	public isAlive = true;
	public id = uuidv4();

	public gameId: string | null = null;
	public isHost = false;

	private lastPing = Date.now();

	constructor(private socket: WebSocket, private server: GameServer) {
		this.socket.on("message", (data) => this.onMessage(data));
		this.socket.on("close", () => this.onClose());
	}

	public init() {
		this.send({ init: this.id });
		this.pingLoop();
		this.server.updateGamesList(this);
	}

	private onMessage(data: WebSocket.Data) {
		try {
			const rpcs = JSON.parse(data.toString()) as RPCPacket[];
			rpcs.forEach((rpc) => {
				rpc.callerId = this.id;
				RPCController.handlePacket(rpc, this);
			});

			const broadcast = rpcs.filter((rpc) => {
				return !broadcastIgnore.some((ignore) => {
					return rpc.className == ignore.className && rpc.method == ignore.method;
				});
			});

			const game = this.server.getGameById(this.gameId);
			if (game) game.broadcastRPCs(broadcast, this);

		} catch (e) {
			console.log(`Error parsing message: ${e}`);
			console.log(data.toString());
		}
	}

	private onClose() {
		this.isAlive = false;
		this.maybeLeaveCurrentGame();
		this.server.removeClient(this);
	}

	public send(message: any) {
		this.socket.send(JSON.stringify(message));
	}

	private pingLoop() {
		if (!this.isAlive || this.socket.readyState != WebSocket.OPEN) {
			return;
		}

		if (Date.now() - this.lastPing > PING_RATE * 5) {
			console.log(`Client ${this.id} timed out`);
			this.socket.terminate();
			return;
		}

		this.ping();
		setTimeout(() => this.pingLoop(), PING_RATE);
	}

	private maybeLeaveCurrentGame() {
		if (this.gameId != null) {
			const currentGame = this.server.getGameById(this.gameId);
			console.log(`Checking leave for: `, currentGame.toString());
			if (currentGame) {
				currentGame.handleClientLeave(this);
				this.isHost = false;
			}
		}
	}

	public toString() {
		return `WSClient(${this.id})`;
	}

	@RPC("out")
	ping() { }

	@RPC("in")
	pong() {
		this.lastPing = Date.now();
	}

	@RPC("in")
	joinGame(gameId: string) {
		const game = this.server.getGameById(gameId);
		if (!game) {
			console.log(`Client ${this.id} tried to join game ${gameId} but it doesn't exist`);
			return;
		}

		this.maybeLeaveCurrentGame();

		console.log(`Client ${this.id} attempting to join ${game}`);
		game.handleNewClient(this);
	}

	@RPC("out")
	joinGameResult(success: boolean) { }

	@RPC("in")
	createGame(name: string) {
		this.maybeLeaveCurrentGame();

		this.isHost = true;
		this.server.createGame(name, this);
	}

	@RPC("out")
	gameList(games: GameData[]) { }
}

export { WSClient };