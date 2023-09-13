var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NetEntity } from "../../components/netEntity.js";
import { GameEngine } from "../../engine.js";
import { Component } from "../../entity/component.js";
import { Entity } from "../../entity/entity.js";
import { Logger } from "../../logger.js";
import { Routine } from "../../routine/routine.js";
import { EventEmitter } from "../../utils/eventEmitter.js";
import { EnableRPCs, RPC, RPCController } from "../rpc.js";
import { Client } from "./client.js";
import { Game } from "./game.js";
let NetworkManager = class NetworkManager extends EventEmitter {
    get isHost() {
        if (this.game != null) {
            return this.game.host == this.client.id;
        }
        return false;
    }
    get game() {
        if (this.client && this.client.connectedGame)
            return this.client.connectedGame;
        return null;
    }
    constructor(url) {
        super();
        this.url = url;
        this.games = [];
        this.idBuffer = [];
        this.ready = false;
        this.cachedInstantiations = [];
        this.networkIdToEntity = new Map();
    }
    init() {
        Logger.info(`Connecting to server at ${this.url}`);
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
            Logger.info(`Websocket connected to ${this.url}`);
            this.emit("connected");
        };
        this.ws.onmessage = (e) => this.handleMessage(e);
        this.ws.onclose = () => {
            Logger.error(`Websocket closed`);
            this.emit("disconnected");
        };
        this.ws.onerror = (e) => { Logger.error(`Websocket error: ${e}`); };
        RPCController.init((packets) => {
            this.ws.send(JSON.stringify(packets));
        });
    }
    handleMessage(e) {
        const packet = JSON.parse(e.data);
        const keys = Object.keys(packet);
        if (keys.length == 1 && keys[0] == "init") {
            this.setupClient(packet.init);
            return;
        }
        RPCController.handlePacket(packet);
    }
    setupClient(id) {
        this.client = new Client(id, this);
        this.client.on("game_list", (gameDatas) => {
            gameDatas.forEach(gameData => {
                const game = this.getGameById(gameData.id);
                if (game) {
                    game.updateFromData(gameData);
                }
                else {
                    const newGame = new Game(gameData.id);
                    newGame.updateFromData(gameData);
                    Logger.info(`New game created: ${newGame}`);
                    this.games.push(newGame);
                    this.emit("new_game", newGame);
                }
            });
            this.games.forEach(game => {
                if (!gameDatas.find(gameData => gameData.id == game.id)) {
                    Logger.info(`Game closed: ${game}`);
                    this.emit("game_closed", game);
                }
            });
            this.games = this.games.filter(game => gameDatas.find(gameData => gameData.id == game.id));
        });
        this.client.on("join_game_result", (result) => {
            if (result)
                Routine.startCoroutine(this.setupGame());
        });
        this.emit("ready");
        this.ready = true;
    }
    *setupGame() {
        Logger.info(`Waiting for game info to populate`);
        yield Routine.waitUntil(() => this.game != null);
        Logger.info(`Game info received ${this.isHost ? "(host)" : "(client)"}`);
        if (this.isHost) {
            this.game.on("client_leave", (clientId) => {
                this.destroyClientEntities(clientId);
            });
        }
        this.requestResync();
    }
    getGameById(id) {
        return this.games.find((game) => game.id == id);
    }
    getGameByHostId(id) {
        return this.games.find((game) => game.host == id);
    }
    update(dt) {
        RPCController.flush();
    }
    destroyClientEntities(clientId) {
        const netEntities = GameEngine.instance.getEntitiesWithComponent(NetEntity);
        netEntities.forEach(netEntity => {
            const netComp = netEntity.getComponent(NetEntity);
            if (netComp.ownerId == clientId) {
                netEntity.destroy();
                this.netDestroy(netComp.entityNetworkId);
            }
        });
    }
    netInstantiate(entityNetworkId, ownerId, components, directedClient) {
        if (this.isHost && !this.cachedInstantiations.some(i => i.entityNetworkId == entityNetworkId)) {
            console.log(`Cached new instantiation for ${entityNetworkId} (${ownerId})`);
            this.cachedInstantiations.push({ entityNetworkId, components, ownerId });
        }
        if (this.netInfo.isLocal() || (directedClient && directedClient != this.client.id))
            return;
        Logger.info(`Instantiating entity ${entityNetworkId} with components`);
        const entity = new Entity();
        entity.isLocal = false;
        components.forEach(info => {
            const ctor = Component.getComponentByName(info.component);
            if (!ctor) {
                Logger.error(`Component ${info.component} not found`);
                return;
            }
            const component = new ctor(...info.args);
            component.id = info.id;
            entity.addComponent(component);
        });
        const netEntity = entity.getComponent(NetEntity);
        netEntity.entityNetworkId = entityNetworkId;
        netEntity.ownerId = ownerId;
        GameEngine.instance.entities.push(entity);
        entity.awake();
    }
    netDestroy(netEntityId) {
        if (!netEntityId) {
            Logger.error("NetEntityId is null for netDestroy");
            return;
        }
        const entity = this.getEntityByNetworkId(netEntityId);
        if (!entity) {
            Logger.warn(`Entity with network id ${netEntityId} not found`);
            return;
        }
        const netEntity = entity.getComponent(NetEntity);
        if (this.isHost && netEntity) {
            this.cachedInstantiations = this.cachedInstantiations.filter(i => i.entityNetworkId != netEntity.entityNetworkId);
        }
        if (this.netInfo.isLocal())
            return;
        entity.destroy();
    }
    getEntityByNetworkId(id) {
        if (this.networkIdToEntity.has(id)) {
            return this.networkIdToEntity.get(id);
        }
        const entities = GameEngine.instance.getEntitiesWithComponent(NetEntity);
        const entity = entities.find(e => e.getComponent(NetEntity).entityNetworkId == id);
        if (!entity) {
            Logger.error(`Unable to find entity with network id ${id}`);
            return;
        }
        this.networkIdToEntity.set(id, entity);
        return entity;
    }
    *instantiateEntity(entity) {
        const netEntityComponent = entity.getComponent(NetEntity);
        const reqIdCount = entity.components.length + 1;
        this.requestIds(reqIdCount);
        yield Routine.waitUntil(() => this.idBuffer.length >= reqIdCount);
        const ids = this.idBuffer.splice(0, reqIdCount);
        netEntityComponent.entityNetworkId = ids[0];
        const components = entity.components.map((c, idx) => {
            c.id = ids[idx + 1];
            const componentName = Component.getComponentName(c);
            if (!componentName) {
                Logger.error(`Component ${c} has not registered as a NetComponent (no __orgName)`);
                return null;
            }
            if (!c.__netInitArgs) {
                Logger.error(`Component ${c} has not assigned __netInitArgs`);
            }
            return {
                component: componentName,
                args: c.__netInitArgs,
                id: c.id
            };
        });
        this.netInstantiate(netEntityComponent.entityNetworkId, this.client.id, components);
    }
    requestIds(count) {
        var _a;
        if (this.isHost) {
            let ids = [];
            for (let i = 0; i < count; i++) {
                ids.push(GameEngine.getNextId());
            }
            return this.giveIds(ids, (_a = this.netInfo.callerId) !== null && _a !== void 0 ? _a : this.client.id);
        }
    }
    giveIds(ids, user) {
        if (this.client.id == user) {
            this.idBuffer.push(...ids);
            GameEngine.skipIds(ids);
        }
    }
    requestResync() {
        if (this.isHost) {
            Logger.info(`Client ${this.netInfo.callerId} requested resync`);
            this.cachedInstantiations.forEach(info => {
                this.netInstantiate(info.entityNetworkId, info.ownerId, info.components, this.netInfo.callerId);
            });
            this.requestClientEntityResync(this.netInfo.callerId);
        }
    }
    requestClientEntityResync(clientId) {
        this.emit("client_resync", clientId);
    }
};
__decorate([
    RPC("bi")
], NetworkManager.prototype, "netInstantiate", null);
__decorate([
    RPC("bi")
], NetworkManager.prototype, "netDestroy", null);
__decorate([
    RPC("bi")
], NetworkManager.prototype, "requestIds", null);
__decorate([
    RPC("bi")
], NetworkManager.prototype, "giveIds", null);
__decorate([
    RPC("bi", "remote")
], NetworkManager.prototype, "requestResync", null);
__decorate([
    RPC("bi")
], NetworkManager.prototype, "requestClientEntityResync", null);
NetworkManager = __decorate([
    EnableRPCs("singleInstance")
], NetworkManager);
export { NetworkManager };
