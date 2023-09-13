import { EventEmitter } from "../utils/eventEmitter.js";
import { Vector2 } from "../utils/vector2.js";
import { Component } from "./component.js";
interface Transform {
    position: Vector2;
    rotation: number;
    width: number;
    height: number;
}
declare type Ctor<T> = new (...args: any[]) => T;
declare class Entity extends EventEmitter {
    id: number;
    transform: Transform;
    isActive: boolean;
    components: Component[];
    private componentLookup;
    tags: Set<string>;
    isLocal: boolean;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    get position(): Vector2;
    get rotation(): number;
    set rotation(value: number);
    constructor();
    awake(): void;
    update(dt: number): void;
    destroy(): void;
    addComponent(component: Component): void;
    addComponents(...components: Component[]): void;
    removeComponent(component: Component): void;
    getComponent<T extends Component>(type: Ctor<T>): T;
    getComponents<T extends Component>(type: Ctor<T>): T[];
    hasComponent<T extends Component>(type: Ctor<T>): boolean;
    hasTag(tag: string): boolean;
    toString(): string;
}
export { Entity, Ctor };
