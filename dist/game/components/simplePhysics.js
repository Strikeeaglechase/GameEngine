var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PartialEmitter } from "../../components/particleEmitter.js";
import { Component, NetComponent } from "../../entity/component.js";
import { Vector2 } from "../../utils/vector2.js";
let LimitedLifetime = class LimitedLifetime extends Component {
    constructor(lifetime) {
        super();
        this.lifetime = lifetime;
        this.awakeAt = 0;
    }
    awake() {
        this.awakeAt = Date.now();
    }
    update(dt) {
        if (Date.now() > this.awakeAt + this.lifetime * 1000) {
            this.entity.destroy();
        }
    }
};
LimitedLifetime = __decorate([
    NetComponent
], LimitedLifetime);
let SimpleMoverPhysics = class SimpleMoverPhysics extends Component {
    constructor(decel) {
        super();
        this.decel = decel;
        this.velocity = Vector2.zero;
    }
    update(dt) {
        const pos = this.entity.transform.position;
        const vel = this.velocity;
        pos.add(vel.clone().multiply(dt));
        vel.multiply(this.decel);
        const emitter = this.entity.getComponent(PartialEmitter);
        if (emitter) {
            emitter.options.size = Math.max(vel.length() / 10, 1);
        }
    }
};
SimpleMoverPhysics = __decorate([
    NetComponent
], SimpleMoverPhysics);
export { SimpleMoverPhysics, LimitedLifetime };
