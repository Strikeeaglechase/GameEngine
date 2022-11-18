var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PartialEmitter } from "../../components/particleEmitter.js";
import { Component, NetComponent } from "../../entity/component.js";
import { Routine } from "../../routine/routine.js";
let ExplosionEffect = class ExplosionEffect extends Component {
    awake() {
        this.emitter = new PartialEmitter({
            rate: 0,
            lifetime: 1,
            lifetimeJitter: 0.5,
            angle: 0,
            angleJitter: 360,
            speed: 100,
            speedJitter: 50,
            color: [255, 0, 0, 255],
            fadeTo: 50,
            deceleration: 0.985
        });
        this.emitter.enabled = false;
        this.entity.addComponent(this.emitter);
        this.engine.on("mouse_down", (action) => {
            this.entity.transform.position.set(action.position);
            Routine.startCoroutine(this.explosionRoutine());
        });
    }
    *explosionRoutine() {
        this.emitter.enabled = true;
        yield Routine.wait(0.1);
        this.emitter.enabled = false;
    }
};
ExplosionEffect = __decorate([
    NetComponent
], ExplosionEffect);
export { ExplosionEffect };
