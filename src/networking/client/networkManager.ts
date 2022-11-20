import { NetEntity } from "../../components/netEntity.js";
import { GameEngine } from "../../engine.js";
import { Component } from "../../entity/component.js";
import { Ctor, Entity } from "../../entity/entity.js";
import { Logger } from "../../logger.js";
import { Routine } from "../../routine/routine.js";
import { EventEmitter } from "../../utils/eventEmitter.js";
import { EnableRPCs, NetInfo, RPC, RPCController } from "../rpc.js";
import { GameData } from "../server/game.js";
import { Client } from "./client.js";
import { Game } from "./game.js";

interface ComponentInitInfo {
	component: string;
	args: any[];
	id: number;
}

@EnableRPCs("singleInstance")
class NetworkManager extends EventEmitter<"connected" | "ready" | "disconnected" | "new_game" | "game_closed" | "client_resync"> {
	private ws: WebSocket;
	public client: Client;
	public games: Game[] = [];
	private idBuffer: number[] = [];
	private netInfo: NetInfo;
	public get isHost() {
		if (this.game != null) {
			return this.game.host == this.client.id;
		}
		return false;
	}

	public get game() {
		if (this.client && this.client.connectedGame) return this.client.connectedGame;
		return null;
	}

	public ready = false;
	private cachedInstantiations: { entityNetworkId: number, components: ComponentInitInfo[]; ownerId: string; }[] = [];
	private networkIdToEntity: Map<number, Entity> = new Map();

	constructor(private url: string) {
		super();
	}

	public init() {
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

	private handleMessage(e: MessageEvent) {
		const packet = JSON.parse(e.data);
		const keys = Object.keys(packet);
		if (keys.length == 1 && keys[0] == "init") {
			this.setupClient(packet.init);
			return;
		}

		RPCController.handlePacket(packet);
	}

	private setupClient(id: string) {
		this.client = new Client(id, this);

		this.client.on("game_list", (gameDatas: GameData[]) => {
			gameDatas.forEach(gameData => {
				const game = this.getGameById(gameData.id);
				if (game) {
					game.updateFromData(gameData);
				} else {
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

		this.client.on("join_game_result", (result: boolean) => {
			if (result) Routine.startCoroutine(this.setupGame());
		});

		this.emit("ready");
		this.ready = true;
	}

	private *setupGame() {
		Logger.info(`Waiting for game info to populate`);
		yield Routine.waitUntil(() => this.game != null);
		Logger.info(`Game info received ${this.isHost ? "(host)" : "(client)"}`);
		if (this.isHost) {
			this.game.on("client_leave", (clientId: string) => {
				this.destroyClientEntities(clientId);
			});
		}
		this.requestResync();
	}

	public getGameById(id: string) {
		return this.games.find((game) => game.id == id);
	}

	public getGameByHostId(id: string) {
		return this.games.find((game) => game.host == id);
	}

	public update(dt: number) {
		RPCController.flush();
	}

	private destroyClientEntities(clientId: string) {
		const netEntities = GameEngine.instance.getEntitiesWithComponent(NetEntity);
		netEntities.forEach(netEntity => {
			const netComp = netEntity.getComponent(NetEntity);
			if (netComp.ownerId == clientId) {
				netEntity.destroy();
				this.netDestroy(netComp.entityNetworkId);
			}
		});
	}

	@RPC("bi")
	private netInstantiate(entityNetworkId: number, ownerId: string, components: ComponentInitInfo[], directedClient?: string) {
		if (this.isHost && !this.cachedInstantiations.some(i => i.entityNetworkId == entityNetworkId)) {
			console.log(`Cached new instantiation for ${entityNetworkId} (${ownerId})`);
			this.cachedInstantiations.push({ entityNetworkId, components, ownerId });
		}
		if (this.netInfo.isLocal() || (directedClient && directedClient != this.client.id)) return;

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

	@RPC("bi")
	public netDestroy(netEntityId: number) {
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
		if (this.netInfo.isLocal()) return;
		entity.destroy();

	}

	public getEntityByNetworkId(id: number) {
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

	public *instantiateEntity(entity: Entity) {
		const netEntityComponent = entity.getComponent(NetEntity);
		const reqIdCount = entity.components.length + 1;
		this.requestIds(reqIdCount);
		yield Routine.waitUntil(() => this.idBuffer.length >= reqIdCount);

		const ids = this.idBuffer.splice(0, reqIdCount);
		netEntityComponent.entityNetworkId = ids[0];

		const components: ComponentInitInfo[] = entity.components.map((c, idx) => {
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

		this.netInstantiate(
			netEntityComponent.entityNetworkId,
			this.client.id,
			components
		);
	}

	@RPC("bi")
	private requestIds(count: number) {
		if (this.isHost) {
			let ids: number[] = [];
			for (let i = 0; i < count; i++) {
				ids.push(GameEngine.getNextId());
			}
			return this.giveIds(ids, this.netInfo.callerId ?? this.client.id);
		}
	}

	@RPC("bi")
	private giveIds(ids: number[], user: string) {
		if (this.client.id == user) {
			this.idBuffer.push(...ids);
			GameEngine.skipIds(ids);
		}
	}

	@RPC("bi", "remote")
	private requestResync() {
		if (this.isHost) {
			Logger.info(`Client ${this.netInfo.callerId} requested resync`);
			this.cachedInstantiations.forEach(info => {
				this.netInstantiate(info.entityNetworkId, info.ownerId, info.components, this.netInfo.callerId);
			});
			this.requestClientEntityResync(this.netInfo.callerId);
		}
	}

	@RPC("bi")
	private requestClientEntityResync(clientId: string) {
		this.emit("client_resync", clientId);
	}
}

export { NetworkManager };