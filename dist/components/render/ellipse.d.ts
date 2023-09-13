import { Component } from "../../entity/component.js";
import { ColorValue } from "../../render/color.js";
declare class Ellipse extends Component {
    width: number;
    height: number;
    fillColor: ColorValue;
    strokeColor: ColorValue;
    constructor(width: number, height: number, fillColor?: ColorValue | null, strokeColor?: ColorValue | null);
    update(dt: number): void;
}
export { Ellipse };
