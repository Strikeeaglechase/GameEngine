import { Component } from "../../entity/component.js";
declare class WorldBackground extends Component {
    update(dt: number): void;
}
declare class WorldInteractions extends Component {
    private getGridPoint;
    awake(): void;
    private checkForNewCells;
    private createCellAtPoint;
    private handleMouseDownSingle;
    private handleMouseDown;
    update(dt: number): void;
}
export { WorldBackground, WorldInteractions };
