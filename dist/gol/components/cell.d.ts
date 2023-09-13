import { Component } from "../../entity/component.js";
import { Entity } from "../../entity/entity.js";
import { Vector2 } from "../../utils/vector2.js";
declare const CELL_SIZE = 32;
declare class CellRenderer extends Component {
    update(dt: number): void;
}
declare class Cell extends Component {
    neighborPoints: Vector2[];
    neighbors: Entity[];
    private nextState;
    awake(): void;
    private addNeighbor;
    private getNabPoints;
    update(dt: number): void;
}
declare function createCell(entity: Entity): void;
export { Cell, CellRenderer, createCell, CELL_SIZE };
