var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, NetComponent } from "../../entity/component.js";
let Rect = class Rect extends Component {
    constructor(fillColor = null, strokeColor = null, round = 0) {
        super();
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.round = round;
        this.center = true;
    }
    update(dt) {
        const pos = this.entity.transform.position.clone();
        const width = this.entity.transform.width;
        const height = this.entity.transform.height;
        if (this.center) {
            pos.x -= width / 2;
            pos.y -= height / 2;
        }
        if (this.fillColor != null)
            this.engine.renderer.rect(pos.x, pos.y, width, height, this.fillColor);
        if (this.strokeColor != null)
            this.engine.renderer.strokeRect(pos.x, pos.y, width, height, this.strokeColor);
    }
};
Rect = __decorate([
    NetComponent
], Rect);
export { Rect };
