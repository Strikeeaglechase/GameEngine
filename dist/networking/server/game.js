var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { v4 as uuidv4 } from "uuid";
import { EnableRPCs, RPC } from "../rpc.js";
let Game = class Game {
    constructor(name, host, server) {
        this.name = name;
        this.host = host;
        this.server = server;
        this.id = uuidv4();
        this.clients = [];
        this.metadata = {};
        console.log(`Game ${this} created by ${host.id}`);
    }
    init() {
        console.log(`Setting up game ${this} to host ${this.host.id}`);
        this.handleNewClient(this.host);
    }
    handleNewClient(client) {
        console.log(`Client ${client.id} joined game ${this}`);
        client.gameId = this.id;
        this.clients.push(client);
        this.clientJoin(client.id);
        this.server.updateGamesList();
        client.joinGameResult(true);
    }
    handleClientLeave(client) {
        console.log(`Client ${client.id} left game ${this}`);
        this.clients = this.clients.filter((c) => c != client);
        if (client == this.host)
            this.close();
        this.clientLeave(client.id);
        this.server.updateGamesList();
    }
    broadcastRPCs(rpcs, client) {
        const message = JSON.stringify(rpcs);
        this.clients.forEach((c) => {
            if (c != client)
                c.send(message);
        });
    }
    close() {
        console.log(`Game ${this} closed`);
        this.clients.forEach(client => client.gameId = null);
        this.gameClose();
        this.server.removeGame(this);
    }
    toData() {
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
    setMetadata(key, value) {
        const rpc = this.netInfo.lastPacket;
        const client = this.server.getClientById(rpc.callerId);
        if (client != this.host) {
            console.log(`Client ${rpc.callerId} tried to set metadata on game ${this.id} but is not the host`);
            return;
        }
        this.metadata[key] = value;
        this.server.updateGamesList();
    }
    clientJoin(clientId) { }
    clientLeave(clientId) { }
    gameClose() { }
};
__decorate([
    RPC("in")
], Game.prototype, "setMetadata", null);
__decorate([
    RPC("out")
], Game.prototype, "clientJoin", null);
__decorate([
    RPC("out")
], Game.prototype, "clientLeave", null);
__decorate([
    RPC("out")
], Game.prototype, "gameClose", null);
Game = __decorate([
    EnableRPCs("instance")
], Game);
export { Game };
