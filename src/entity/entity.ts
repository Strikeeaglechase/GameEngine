import { GameEngine } from "../engine.js";
import { EventEmitter } from "../utils/eventEmitter.js";
import { Vector2 } from "../utils/vector2.js";
import { Component } from "./component.js";

interface Transform {
	position: Vector2;
	rotation: number;
	width: number;
	height: number;
}

type Ctor<T> = new (...args: any[]) => T;

class Entity extends EventEmitter {
	public id: number;
	public transform: Transform = {
		position: Vector2.zero,
		rotation: 0,
		width: 0,
		height: 0
	};
	public isActive = false;
	public components: Component[] = [];
	private componentLookup: Map<Ctor<Component>, Component> = new Map();
	public tags: Set<string> = new Set();
	public isLocal = true;
	public netReady = false;

	get x() {
		return this.transform.position.x;
	}

	set x(value: number) {
		this.transform.position.x = value;
	}

	get y() {
		return this.transform.position.y;
	}

	set y(value: number) {
		this.transform.position.y = value;
	}

	get width() {
		return this.transform.width;
	}

	set width(value: number) {
		this.transform.width = value;
	}

	get height() {
		return this.transform.height;
	}

	set height(value: number) {
		this.transform.height = value;
	}

	get position() {
		return this.transform.position;
	}

	get rotation() {
		return this.transform.rotation;
	}

	set rotation(value: number) {
		this.transform.rotation = value;
	}

	constructor() {
		super();
		this.id = GameEngine.getNextId();
	}

	public awake() {
		this.isActive = true;
		this.components.forEach(c => c.awake());
		this.emit("awake");
	}

	public update(dt: number) {
		this.components.forEach(c => c.update(dt));
	}

	public destroy() {
		this.isActive = false;
		this.tags.add("destroyed");
		this.components.forEach(c => c.destroy());
		this.emit("destroy");
	}

	public addComponent(component: Component) {
		this.components.push(component);
		if (!this.componentLookup.has(component.constructor as Ctor<Component>)) {
			this.componentLookup.set(component.constructor as Ctor<Component>, component);
		}

		component.entity = this;
		if (this.isActive) {
			component.awake();
		}
	}

	public addComponents(...components: Component[]) {
		components.forEach(c => this.addComponent(c));
	}

	public removeComponent(component: Component) {
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

	public getComponent<T extends Component>(type: Ctor<T>): T {
		if (this.componentLookup.has(type)) return this.componentLookup.get(type) as T;
		return this.components.find(c => c instanceof type) as T;
	}

	public getComponents<T extends Component>(type: Ctor<T>): T[] {
		return this.components.filter(c => c instanceof type) as T[];
	}

	public hasComponent<T extends Component>(type: Ctor<T>): boolean {
		return this.components.some(c => c instanceof type);
	}

	public hasTag(tag: string): boolean {
		return this.tags.has(tag);
	}

	toString() {
		return `Entity ${this.id} (${[...this.tags].join(", ") ?? "no tags"}) ${this.components.map(c => c.toString()).join(", ")}`;
	}
}

export { Entity, Ctor };