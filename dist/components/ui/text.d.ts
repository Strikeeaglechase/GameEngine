import { Component } from "../../entity/component.js";
import { ColorValue } from "../../render/color.js";
declare class Text extends Component {
    text: string;
    color: ColorValue;
    size: number;
    constructor(text: string, color: ColorValue, size: number);
    update(dt: number): void;
    getTextWidth(): number;
    getTextHeight(): number;
}
export { Text };
