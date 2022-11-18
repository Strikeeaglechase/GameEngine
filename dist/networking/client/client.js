var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EventEmitter } from "../../utils/eventEmitter.js";
import { EnableRPCs, RPC } from "../rpc.js";
let Client = class Client extends EventEmitter {
    constructor(id, networkManager) {
        super();
        this.id = id;
        this.networkManager = networkManager;
        this.isJoiningGame = false;
        this.connectedGame = null;
        console.log(`Setup `);
    }
    ping() {
        this.pong();
    }
    pong() { }
    joinGame(gameId) {
        this.isJoiningGame = true;
        this.once("join_game_result", (success) => {
            if (success) {
                this.connectedGame = this.networkManager.getGameById(gameId);
                console.log(`Joined game ${this.connectedGame}`);
            }
        });
    }
    joinGameResult(success) {
        console.log(`Join game result: ${success}`);
        this.isJoiningGame = false;
        this.emit("join_game_result", success);
    }
    createGame(name) {
        this.once("join_game_result", (success) => {
            if (success) {
                this.connectedGame = this.networkManager.getGameByHostId(this.id);
                console.log(`Created game ${this.connectedGame}`);
            }
        });
    }
    gameList(games) {
        this.emit("game_list", games);
    }
};
__decorate([
    RPC("in")
], Client.prototype, "ping", null);
__decorate([
    RPC("out")
], Client.prototype, "pong", null);
__decorate([
    RPC("out")
], Client.prototype, "joinGame", null);
__decorate([
    RPC("in")
], Client.prototype, "joinGameResult", null);
__decorate([
    RPC("out")
], Client.prototype, "createGame", null);
__decorate([
    RPC("in")
], Client.prototype, "gameList", null);
Client = __decorate([
    EnableRPCs("instance", ["WSClient"])
], Client);
export { Client };
