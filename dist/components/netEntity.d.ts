import { Component } from "../entity/component.js";
declare class NetEntity extends Component {
    entityNetworkId: number;
    constructor();
    awake(): void;
    private netSpawnRoutine;
    destroy(): void;
}
export { NetEntity };
