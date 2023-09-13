import { Component } from "../../entity/component.js";
declare class Gravity extends Component {
    mass: number;
    constructor(mass: number);
    update(dt: number): void;
}
export { Gravity };
