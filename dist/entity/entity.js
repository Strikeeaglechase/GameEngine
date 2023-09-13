import { GameEngine } from "../engine.js";
import { EventEmitter } from "../utils/eventEmitter.js";
import { Vector2 } from "../utils/vector2.js";
class Entity extends EventEmitter {
    get x() {
        return this.transform.position.x;
    }
    set x(value) {
        this.transform.position.x = value;
    }
    get y() {
        return this.transform.position.y;
    }
    set y(value) {
        this.transform.position.y = value;
    }
    get width() {
        return this.transform.width;
    }
    set width(value) {
        this.transform.width = value;
    }
    get height() {
        return this.transform.height;
    }
    set height(value) {
        this.transform.height = value;
    }
    get position() {
        return this.transform.position;
    }
    get rotation() {
        return this.transform.rotation;
    }
    set rotation(value) {
        this.transform.rotation = value;
    }
    constructor() {
        super();
        this.transform = {
            position: Vector2.zero,
            rotation: 0,
            width: 0,
            height: 0
        };
        this.isActive = false;
        this.components = [];
        this.componentLookup = new Map();
        this.tags = new Set();
        this.isLocal = true;
        this.netReady = false;
        this.id = GameEngine.getNextId();
    }
    awake() {
        this.isActive = true;
        this.components.forEach(c => c.awake());
        this.emit("awake");
    }
    update(dt) {
        this.components.forEach(c => c.update(dt));
    }
    destroy() {
        this.isActive = false;
        this.tags.add("destroyed");
        this.components.forEach(c => c.destroy());
        this.emit("destroy");
    }
    addComponent(component) {
        this.components.push(component);
        if (!this.componentLookup.has(component.constructor)) {
            this.componentLookup.set(component.constructor, component);
        }
        component.entity = this;
        if (this.isActive) {
            component.awake();
        }
    }
    addComponents(...components) {
        components.forEach(c => this.addComponent(c));
    }
    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            const removed = this.components.splice(index, 1);
            for (let key of this.componentLookup.keys()) {
                if (this.componentLookup.get(key) === removed[0]) {
                    this.componentLookup.delete(key);
                }
            }
        }
    }
    getComponent(type) {
        if (this.componentLookup.has(type))
            return this.componentLookup.get(type);
        return this.components.find(c => c instanceof type);
    }
    getComponents(type) {
        return this.components.filter(c => c instanceof type);
    }
    hasComponent(type) {
        return this.components.some(c => c instanceof type);
    }
    hasTag(tag) {
        return this.tags.has(tag);
    }
    toString() {
        var _a;
        return `Entity ${this.id} (${(_a = [...this.tags].join(", ")) !== null && _a !== void 0 ? _a : "no tags"}) ${this.components.map(c => c.toString()).join(", ")}`;
    }
}
export { Entity };
