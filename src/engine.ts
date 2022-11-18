import { Component } from "./entity/component.js";
import { Ctor, Entity } from "./entity/entity.js";
import { Logger } from "./logger.js";
import { NetworkManager } from "./networking/client/networkManager.js";
import { Renderer } from "./render/renderer.js";
import { RoutineManager } from "./routine/routine.js";
import { System } from "./system.js";
import { EventEmitter } from "./utils/eventEmitter.js";
import { Vector2 } from "./utils/vector2.js";

class GameEngine extends EventEmitter {
	public static instance: GameEngine = new GameEngine();
	public renderer: Renderer;
	public camera: Vector2 = Vector2.zero;
	public mouse: Vector2 = Vector2.zero;
	private previousFrameTime: number = Date.now();
	private lastFrameTimes: number[] = [];
	public networking: NetworkManager;
	public get fps(): number {
		let sum = 0;
		this.lastFrameTimes.forEach(t => sum += t);
		return Math.round(1000 / (sum / this.lastFrameTimes.length));
	}

	public entities: Entity[] = [];
	public world: Entity;
	public keysDown: Record<string, boolean> = {};
	public mouseButtonsDown: boolean[] = [];

	private systems: System[] = [];

	public debugEntityPos = false;

	private static nextId = 0;
	public static getNextId() {
		return GameEngine.nextId++;
	}

	public static skipIds(ids: number[]) {
		const max = Math.max(...ids);
		if (max >= GameEngine.nextId) GameEngine.nextId = max + 1;
	}

	constructor() {
		super();
	}

	public init(renderTargetId: string) {
		this.renderer = new Renderer(renderTargetId);
		Logger.info(`Initialized game engine`);
		this.world = this.createEntity();
		this.world.awake();

		this.addEventListeners();
		this.update();
	}

	private addEventListeners() {
		const canvas = this.renderer.canvas;

		canvas.addEventListener("mousemove", (e) => {
			const prev = this.mouse.clone();
			this.mouse.set(e.clientX, e.clientY);
			this.emit("mouse_move", { previous: prev, current: this.mouse });
		});

		canvas.addEventListener("mousedown", (e) => {
			this.mouseButtonsDown[e.button] = true;
			this.emit("mouse_down", { position: this.mouse, button: e.button });
		});

		canvas.addEventListener("mouseup", (e) => {
			this.mouseButtonsDown[e.button] = false;
			this.emit("mouse_up", { position: this.mouse, button: e.button });
		});

		window.addEventListener("keydown", (e) => {
			this.keysDown[e.key] = true;
			this.emit("key_down", e.key);
		});

		window.addEventListener("keyup", (e) => {
			this.keysDown[e.key] = false;
			this.emit("key_up", e.key);
		});
	}

	private updateTime(): number {
		const now = Date.now();
		const dt = now - this.previousFrameTime;

		this.lastFrameTimes.push(dt);
		if (this.lastFrameTimes.length > 100) {
			this.lastFrameTimes.shift();
		}

		this.previousFrameTime = now;

		return dt / 1000;
	}

	public initializeNetworking(url: string) {
		this.networking = new NetworkManager(url);
		this.networking.init();
	}

	public update() {
		const dt = this.updateTime();

		this.renderer.transform(this.camera.x, this.camera.y, 0);

		RoutineManager.instance.update(dt);

		this.systems.forEach(s => {
			if (s.isActive) s.update(dt);
		});

		this.entities.forEach(e => {
			e.update(dt);
			if (this.debugEntityPos) {
				this.renderer.ellipse(e.x, e.y, 5, 5, [255, 0, 0]);
			}
		});

		this.entities = this.entities.filter(e => !e.hasTag("destroyed"));
		if (this.networking) this.networking.update(dt);

		this.renderer.revert();

		requestAnimationFrame(() => this.update());
	}

	public resize(width: number, height: number) {
		this.renderer.resize(width, height);
	}

	public screenToWorld(pos: Vector2): Vector2 {
		return pos.clone().subtract(this.camera);
	}

	public worldToScreen(pos: Vector2): Vector2 {
		return pos.clone().add(this.camera);
	}

	public addSystem(system: System, loadOnAdd: boolean = true) {
		this.systems.push(system);
		if (loadOnAdd) system.setup();
	}

	public getSystem<T extends System>(type: Ctor<T>): T {
		return this.systems.find(s => s instanceof type) as T;
	}

	public removeSystem(system: System) {
		if (system.isActive) system.destroy();
		this.systems = this.systems.filter(s => s !== system);
	}

	public createEntity(): Entity {
		const entity = new Entity();
		this.entities.push(entity);
		// Logger.debug(`Created entity ${entity}`);
		return entity;
	}

	// private destroyEntity(entity: Entity) {
	// 	entity.destroy();
	// 	this.entities = this.entities.filter(e => e.id !== entity.id);
	// Logger.debug(`Destroyed entity ${entity}`);
	// }

	public getEntityById(id: number): Entity {
		return this.entities.find(e => e.id === id);
	}

	public getEntitiesByTag(tag: string): Entity[] {
		return this.entities.filter(e => e.hasTag(tag));
	}

	public getEntitiesWithComponent<T extends Component>(type: Ctor<T>): Entity[] {
		return this.entities.filter(e => e.hasComponent(type));
	}

	public getAllComponents<T extends Component>(type: Ctor<T>): T[] {
		const components: T[] = [];
		this.entities.forEach(e => {
			const entityComponents = e.getComponents(type);
			components.push(...entityComponents);
		});

		return components;
	}
}

// @ts-ignore
if (window != undefined && window.engine == undefined) {
	// @ts-ignore
	window.engine = GameEngine.instance;
}

export { GameEngine };