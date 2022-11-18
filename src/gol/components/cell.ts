import { Component } from "../../entity/component.js";
import { Entity } from "../../entity/entity.js";
import { Vector2 } from "../../utils/vector2.js";

const CELL_SIZE = 32;
class CellRenderer extends Component {
	public override update(dt: number) {
		const cell = this.entity.getComponent(Cell);
		this.engine.renderer.transform(this.entity.transform.position.x, this.entity.transform.position.y, 0);
		this.engine.renderer.rect(0, 0, CELL_SIZE, CELL_SIZE, 0);
		this.engine.renderer.text(cell.neighbors.length.toString(), CELL_SIZE / 2, CELL_SIZE / 2, 255);
		this.engine.renderer.revert();
	}
}

const GOL_RULES = [false, false, true, true, false, false, false, false, false];
class Cell extends Component {
	public neighborPoints: Vector2[] = [];
	public neighbors: Entity[] = [];

	private nextState = true;

	public override awake(): void {
		this.neighborPoints = this.getNabPoints();
		const cells = this.engine.getEntitiesWithComponent(Cell);
		cells.forEach(cell => {
			if (this.neighborPoints.some(point => point.equals(cell.transform.position))) {
				this.addNeighbor(cell);
			}
		});

		this.engine.on("new_cell", (entity: Entity) => {
			if (this.neighborPoints.some(point => point.equals(entity.transform.position))) {
				this.addNeighbor(entity);
			}
		});

		this.engine.on("compute_next_state", () => {
			this.nextState = GOL_RULES[this.neighbors.length];
		});

		this.engine.on("set_next_state", () => {
			if (!this.nextState) {
				this.entity.destroy();
			}
		});
	}

	private addNeighbor(entity: Entity) {
		this.neighbors.push(entity);
		entity.on("destroy", () => {
			this.neighbors = this.neighbors.filter(e => e !== entity);
		});
	}

	private getNabPoints(): Vector2[] {
		const points: Vector2[] = [];
		for (let j = -1; j < 2; j++) {
			for (let i = -1; i < 2; i++) {
				if (i == 0 && j == 0) continue;
				const point = new Vector2(this.entity.transform.position.x + i * CELL_SIZE, this.entity.transform.position.y + j * CELL_SIZE);
				points.push(point);
			}
		}

		return points;
	}

	public override update(dt: number): void {
	}
}

function createCell(entity: Entity) {
	entity.addComponents(new Cell(), new CellRenderer());
	entity.awake();
}

export { Cell, CellRenderer, createCell, CELL_SIZE };