import { Entity } from "../../entity/entity.js";
import { EventEmitter } from "../../utils/eventEmitter.js";
import { Client } from "./client.js";
import { Game } from "./game.js";
declare class NetworkManager extends EventEmitter<"connected" | "ready" | "disconnected" | "new_game" | "game_closed"> {
    private url;
    private ws;
    client: Client;
    games: Game[];
    private idBuffer;
    private netInfo;
    isHost: boolean;
    ready: boolean;
    private cachedInstantiations;
    private networkIdToEntity;
    constructor(url: string);
    init(): void;
    private handleMessage;
    private setupClient;
    getGameById(id: string): Game;
    getGameByHostId(id: string): Game;
    update(dt: number): void;
    private netInstantiate;
    netDestroy(netEntityId: number): void;
    getEntityByNetworkId(id: number): Entity;
    instantiateEntity(entity: Entity): Generator<Promise<void>, void, unknown>;
    private requestIds;
    private giveIds;
    requestResync(): void;
}
export { NetworkManager };
