var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";
import { EnableRPCs, RPC, RPCController } from "../rpc.js";
const PING_RATE = 5000;
const broadcastIgnore = [
    { className: "WSClient", method: "pong" },
    { className: "WSClient", method: "joinGame" },
];
let WSClient = class WSClient {
    constructor(socket, server) {
        this.socket = socket;
        this.server = server;
        this.isAlive = true;
        this.id = uuidv4();
        this.gameId = null;
        this.isHost = false;
        this.lastPing = Date.now();
        this.socket.on("message", (data) => this.onMessage(data));
        this.socket.on("close", () => this.onClose());
    }
    init() {
        this.send({ init: this.id });
        this.pingLoop();
        this.server.updateGamesList(this);
    }
    onMessage(data) {
        try {
            const rpcs = JSON.parse(data.toString());
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
            if (game)
                game.broadcastRPCs(broadcast, this);
        }
        catch (e) {
            console.log(`Error parsing message: ${e}`);
            console.log(data.toString());
        }
    }
    onClose() {
        this.isAlive = false;
        this.maybeLeaveCurrentGame();
        this.server.removeClient(this);
    }
    send(message) {
        this.socket.send(JSON.stringify(message));
    }
    pingLoop() {
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
    maybeLeaveCurrentGame() {
        if (this.gameId != null) {
            const currentGame = this.server.getGameById(this.gameId);
            console.log(`Checking leave for: `, currentGame.toString());
            if (currentGame) {
                currentGame.handleClientLeave(this);
                this.isHost = false;
            }
        }
    }
    toString() {
        return `WSClient(${this.id})`;
    }
    ping() { }
    pong() {
        this.lastPing = Date.now();
    }
    joinGame(gameId) {
        const game = this.server.getGameById(gameId);
        if (!game) {
            console.log(`Client ${this.id} tried to join game ${gameId} but it doesn't exist`);
            return;
        }
        this.maybeLeaveCurrentGame();
        console.log(`Client ${this.id} attempting to join ${game}`);
        game.handleNewClient(this);
    }
    joinGameResult(success) { }
    createGame(name) {
        this.maybeLeaveCurrentGame();
        this.isHost = true;
        this.server.createGame(name, this);
    }
    gameList(games) { }
};
__decorate([
    RPC("out")
], WSClient.prototype, "ping", null);
__decorate([
    RPC("in")
], WSClient.prototype, "pong", null);
__decorate([
    RPC("in")
], WSClient.prototype, "joinGame", null);
__decorate([
    RPC("out")
], WSClient.prototype, "joinGameResult", null);
__decorate([
    RPC("in")
], WSClient.prototype, "createGame", null);
__decorate([
    RPC("out")
], WSClient.prototype, "gameList", null);
WSClient = __decorate([
    EnableRPCs("instance", ["Client"])
], WSClient);
export { WSClient };
