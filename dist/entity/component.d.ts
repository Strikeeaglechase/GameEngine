import { GameEngine } from "../engine.js";
import { BiMap } from "../utils/biMap.js";
import { Ctor, Entity } from "./entity.js";
declare abstract class Component {
    protected engine: GameEngine;
    entity: Entity;
    id: number;
    __netInitArgs: any[];
    constructor();
    awake(): void;
    update(dt: number): void;
    destroy(): void;
    toString(): any;
    static components: BiMap<string, Ctor<Component>>;
}
declare function NetComponent(target: any): void;
export { Component, NetComponent };
