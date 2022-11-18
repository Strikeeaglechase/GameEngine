var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Gravity_1;
import { Component, NetComponent } from "../../entity/component.js";
import { SimpleMoverPhysics } from "./simplePhysics.js";
const G_MULT = 10000;
let Gravity = Gravity_1 = class Gravity extends Component {
    constructor(mass) {
        super();
        this.mass = mass;
    }
    update(dt) {
        const massObjects = this.engine.getEntitiesWithComponent(Gravity_1);
        for (const massObject of massObjects) {
            if (massObject === this.entity)
                continue;
            const distance = this.entity.transform.position.clone().subtract(massObject.transform.position).length();
            if (distance < 5)
                continue;
            const otherMass = massObject.getComponent(Gravity_1).mass;
            const force = G_MULT * otherMass / (distance * distance);
            const direction = this.entity.transform.position.clone().subtract(massObject.transform.position).normalize();
            this.entity.getComponent(SimpleMoverPhysics).velocity.add(direction.multiply(-force).multiply(dt));
        }
    }
    ;
};
Gravity = Gravity_1 = __decorate([
    NetComponent
], Gravity);
export { Gravity };
