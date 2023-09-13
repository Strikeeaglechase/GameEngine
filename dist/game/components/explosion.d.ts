import { Component } from "../../entity/component.js";
declare class ExplosionEffect extends Component {
    private emitter;
    awake(): void;
    private explosionRoutine;
}
export { ExplosionEffect };
