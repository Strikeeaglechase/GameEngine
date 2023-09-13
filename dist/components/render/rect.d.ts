import { Component } from "../../entity/component.js";
import { ColorValue } from "../../render/color.js";
declare class Rect extends Component {
    fillColor: ColorValue | null;
    strokeColor: ColorValue | null;
    round: number;
    center: boolean;
    constructor(fillColor?: ColorValue | null, strokeColor?: ColorValue | null, round?: number);
    update(dt: number): void;
}
export { Rect };
