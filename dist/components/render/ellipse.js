var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, NetComponent } from "../../entity/component.js";
let Ellipse = class Ellipse extends Component {
    constructor(width, height, fillColor = null, strokeColor = null) {
        super();
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.width = width;
        this.height = height;
    }
    update(dt) {
        const pos = this.entity.transform.position;
        if (this.fillColor != null)
            this.engine.renderer.ellipse(pos.x, pos.y, this.width / 2, this.height / 2, this.fillColor);
        if (this.strokeColor != null)
            this.engine.renderer.strokeEllipse(pos.x, pos.y, this.width / 2, this.height / 2, this.fillColor);
    }
};
Ellipse = __decorate([
    NetComponent
], Ellipse);
export { Ellipse };
