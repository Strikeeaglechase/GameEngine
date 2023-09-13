var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EventEmitter } from "../../utils/eventEmitter.js";
import { EnableRPCs, RPC } from "../rpc.js";
let Game = class Game extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.isOpen = true;
        this.metadata = {};
        this.players = new Set();
    }
    updateFromData(data) {
        this.metadata = data.metadata;
        this.players = new Set(data.players);
        this.host = data.host;
        this.name = data.name;
    }
    setMetadata(key, value) {
        this.metadata[key] = value;
    }
    clientJoin(clientId) {
        this.emit("client_join", clientId);
        this.players.add(clientId);
    }
    clientLeave(clientId) {
        console.log(`Lobby client leave: ${clientId}`);
        this.emit("client_leave", clientId);
        this.players.delete(clientId);
    }
    gameClose() {
        this.emit("game_close");
    }
    toString() {
        return `${this.name} (${this.id}) (${this.players.size} players)`;
    }
};
__decorate([
    RPC("out")
], Game.prototype, "setMetadata", null);
__decorate([
    RPC("in")
], Game.prototype, "clientJoin", null);
__decorate([
    RPC("in")
], Game.prototype, "clientLeave", null);
__decorate([
    RPC("in")
], Game.prototype, "gameClose", null);
Game = __decorate([
    EnableRPCs("instance")
], Game);
export { Game };
