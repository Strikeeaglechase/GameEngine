var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, NetComponent } from "../../entity/component.js";
import { Text } from "./text.js";
let Button = class Button extends Component {
    constructor(onClick, updateToText = false) {
        super();
        this.onClick = onClick;
        this.updateToText = updateToText;
    }
    awake() {
        this.engine.on("mouse_down", (e) => {
            const pos = this.entity.transform.position;
            const width = this.entity.transform.width / 2;
            const height = this.entity.transform.height / 2;
            if (e.button == 0 && pos.x > e.position.x - width && pos.x < e.position.x + width && pos.y > e.position.y - height && pos.y < e.position.y + height) {
                this.onClick();
            }
        }).disableWhen(() => !this.entity.isActive);
    }
    update(dt) {
        if (this.updateToText) {
            const text = this.entity.getComponent(Text);
            if (text) {
                this.entity.transform.width = text.getTextWidth() + 10;
                this.entity.transform.height = text.getTextHeight() + 5;
            }
        }
    }
};
Button = __decorate([
    NetComponent
], Button);
export { Button };
