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
class NetworkManager extends EventEmitter<"connected" | "ready" | "disconnected" | "new_game" | "game_closed"> {
	private ws: WebSocket;
	public client: Client;
	public games: Game[] = [];
	private idBuffer: number[] = [];
	private netInfo: NetInfo;
	public isHost = false;
	public ready = false;
	private cachedInstantiations: { entityNetworkId: number, components: ComponentInitInfo[]; }[] = [];
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
					console.log(`New game created: ${newGame}`);
					this.games.push(newGame);

					this.emit("new_game", newGame);
				}
			});

			this.games.forEach(game => {
				if (!gameDatas.find(gameData => gameData.id == game.id)) {
					console.log(`Game closed: ${game}`);
					this.emit("game_closed", game);
				}
			});

			this.games = this.games.filter(game => gameDatas.find(gameData => gameData.id == game.id));
		});

		this.emit("ready");
		this.ready = true;
	}

	public getGameById(id: string) {
		return this.games.find((game) => game.id == id);
	}

	public getGameByHostId(id: string) {
		return this.games.find((game) => game.host == id);
	}

	public update(dt: number) {
		RPCController.flush();
		if (this.client && this.client.connectedGame) {
			this.isHost = this.client.connectedGame.host == this.client.id;
		}
	}

	@RPC("bi")
	private netInstantiate(entityNetworkId: number, components: ComponentInitInfo[], directedClient?: string) {
		if (this.netInfo.isLocal() || (directedClient && directedClient != this.client.id)) return;
		if (this.isHost) {
			this.cachedInstantiations.push({ entityNetworkId, components });
		}

		console.log(`Instantiating entity ${entityNetworkId} with components ${components.map(c => c.component).join(", ")}`);
		const entity = new Entity();
		entity.isLocal = false;

		components.forEach(info => {
			const ctor = Component.components.getByKey(info.component);
			const component = new ctor(...info.args);
			component.id = info.id;
			entity.addComponent(component);
		});

		const netEntity = entity.getComponent(NetEntity);
		netEntity.entityNetworkId = entityNetworkId;

		entity.awake();
	}

	@RPC("bi")
	public netDestroy(netEntityId: number) {
		if (!netEntityId) {
			console.error("NetEntityId is null for netDestroy");
			return;
		}

		const entity = this.getEntityByNetworkId(netEntityId);
		if (!entity) {
			console.warn(`Entity with network id ${netEntityId} not found`);
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
			console.error(`Unable to find entity with network id ${id}`);
			return;
		}

		this.networkIdToEntity.set(id, entity);
		return entity;
	}

	public *instantiateEntity(entity: Entity) {
		const netEntityComponent = entity.getComponent(NetEntity);
		const reqIdCount = entity.components.length + 1;
		this.requestIds(reqIdCount);
		yield Routine.waitUntil(() => {
			// console.log(`Waiting for ${reqIdCount} ids (${this.idBuffer.length})`);
			return this.idBuffer.length >= reqIdCount;
		});

		console.log(this.idBuffer, reqIdCount);
		const ids = this.idBuffer.splice(0, reqIdCount);
		netEntityComponent.entityNetworkId = ids[0];

		const components: ComponentInitInfo[] = entity.components.map((c, idx) => {
			c.id = ids[idx + 1];
			if (!Component.components.hasValue(c.constructor as Ctor<Component>)) {
				console.error(`Component ${c} has not registered as a NetComponent`);
				return null;
			}
			console.log(c);
			if (!c.__netInitArgs) {
				console.error(`Component ${c} has not assigned __netInitArgs`);
			}

			const component = Component.components.getByValue(c.constructor as Ctor<Component>);
			return {
				component: component,
				args: c.__netInitArgs,
				id: c.id
			};
		});

		this.netInstantiate(
			netEntityComponent.entityNetworkId,
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

	@RPC("bi")
	requestResync() {
		if (this.isHost) {
			this.cachedInstantiations.forEach(info => {
				this.netInstantiate(info.entityNetworkId, info.components, this.netInfo.callerId);
			});
		}
	}
}

export { NetworkManager };