import { Component } from "../../entity/component.js";
import { Vector2 } from "../../utils/vector2.js";
declare class LimitedLifetime extends Component {
    private lifetime;
    private awakeAt;
    constructor(lifetime: number);
    awake(): void;
    update(dt: number): void;
}
declare class SimpleMoverPhysics extends Component {
    decel: number;
    velocity: Vector2;
    constructor(decel: number);
    update(dt: number): void;
    private syncPhysics;
}
export { SimpleMoverPhysics, LimitedLifetime };
