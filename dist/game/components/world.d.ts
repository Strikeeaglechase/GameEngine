import { Component } from "../../entity/component.js";
declare class WorldBackground extends Component {
    awake(): void;
    update(dt: number): void;
}
export { WorldBackground };
