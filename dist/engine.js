import { Entity } from "./entity/entity.js";
import { Logger } from "./logger.js";
import { NetworkManager } from "./networking/client/networkManager.js";
import { Renderer } from "./render/renderer.js";
import { RoutineManager } from "./routine/routine.js";
import { EventEmitter } from "./utils/eventEmitter.js";
import { Vector2 } from "./utils/vector2.js";
class GameEngine extends EventEmitter {
    constructor() {
        super();
        this.camera = Vector2.zero;
        this.mouse = Vector2.zero;
        this.previousFrameTime = Date.now();
        this.lastFrameTimes = [];
        this.entities = [];
        this.keysDown = {};
        this.mouseButtonsDown = [];
        this.systems = [];
        this.debugEntityPos = false;
    }
    get fps() {
        let sum = 0;
        this.lastFrameTimes.forEach(t => sum += t);
        return Math.round(1000 / (sum / this.lastFrameTimes.length));
    }
    static getNextId() {
        return GameEngine.nextId++;
    }
    static skipIds(ids) {
        const max = Math.max(...ids);
        if (max >= GameEngine.nextId)
            GameEngine.nextId = max + 1;
    }
    init(renderTargetId) {
        this.renderer = new Renderer(renderTargetId);
        Logger.info(`Initialized game engine`);
        this.world = this.createEntity();
        this.world.awake();
        this.addEventListeners();
        this.update();
    }
    addEventListeners() {
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
    updateTime() {
        const now = Date.now();
        const dt = now - this.previousFrameTime;
        this.lastFrameTimes.push(dt);
        if (this.lastFrameTimes.length > 100) {
            this.lastFrameTimes.shift();
        }
        this.previousFrameTime = now;
        return dt / 1000;
    }
    initializeNetworking(url) {
        this.networking = new NetworkManager(url);
        this.networking.init();
    }
    update() {
        const dt = this.updateTime();
        this.renderer.transform(this.camera.x, this.camera.y, 0);
        RoutineManager.instance.update(dt);
        this.systems.forEach(s => {
            if (s.isActive)
                s.update(dt);
        });
        this.entities.forEach(e => {
            e.update(dt);
            if (this.debugEntityPos) {
                this.renderer.ellipse(e.x, e.y, 5, 5, [255, 0, 0]);
            }
        });
        this.entities = this.entities.filter(e => !e.hasTag("destroyed"));
        if (this.networking)
            this.networking.update(dt);
        this.renderer.revert();
        requestAnimationFrame(() => this.update());
    }
    resize(width, height) {
        this.renderer.resize(width, height);
    }
    screenToWorld(pos) {
        return pos.clone().subtract(this.camera);
    }
    worldToScreen(pos) {
        return pos.clone().add(this.camera);
    }
    addSystem(system, loadOnAdd = true) {
        this.systems.push(system);
        if (loadOnAdd)
            system.setup();
    }
    getSystem(type) {
        return this.systems.find(s => s instanceof type);
    }
    removeSystem(system) {
        if (system.isActive)
            system.destroy();
        this.systems = this.systems.filter(s => s !== system);
    }
    createEntity() {
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
    getEntityById(id) {
        return this.entities.find(e => e.id === id);
    }
    getEntitiesByTag(tag) {
        return this.entities.filter(e => e.hasTag(tag));
    }
    getEntitiesWithComponent(type) {
        return this.entities.filter(e => e.hasComponent(type));
    }
    getAllComponents(type) {
        const components = [];
        this.entities.forEach(e => {
            const entityComponents = e.getComponents(type);
            components.push(...entityComponents);
        });
        return components;
    }
}
GameEngine.instance = new GameEngine();
GameEngine.nextId = 0;
// @ts-ignore
if (window != undefined && window.engine == undefined) {
    // @ts-ignore
    window.engine = GameEngine.instance;
}
export { GameEngine };
