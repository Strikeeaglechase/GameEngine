import { Component } from "../../entity/component.js";
import { Vector2 } from "../../utils/vector2.js";
import { Cell, CELL_SIZE, createCell } from "./cell.js";

class WorldBackground extends Component {
	public override update(dt: number) {
		this.engine.renderer.clear(51);
		this.engine.renderer.debugObject({ fps: this.engine.fps }, 10, 20, 255);

		// const renderer = this.engine.renderer;
		// renderer.text(this.engine.fps.toString(), renderer.width - 50, 25, 255);
	}
}

class WorldInteractions extends Component {
	private getGridPoint() {
		return this.engine.screenToWorld(this.engine.mouse)
			.divide(CELL_SIZE)
			.floor()
			.multiply(CELL_SIZE);
	}

	public override awake(): void {
		this.engine.on("mouse_down", () => this.handleMouseDown());
		this.engine.on("key_down", (key: string) => {
			if (key == " ") {
				const t = Date.now();
				this.engine.emit("compute_next_state");
				this.checkForNewCells();
				this.engine.emit("set_next_state");
				const fin = Date.now();
				console.log(`Update cycle took ${fin - t}ms`);
			}
		});
	}

	private checkForNewCells() {
		const cells = this.engine.getEntitiesWithComponent(Cell);
		const grid: boolean[][] = [];
		const maxX = Math.max(...cells.map(cell => cell.transform.position.x / CELL_SIZE)) + 3;
		const maxY = Math.max(...cells.map(cell => cell.transform.position.y / CELL_SIZE)) + 3;
		for (let y = 0; y < maxY; y++) {
			grid[y] = [];
			for (let x = 0; x < maxX; x++) {
				grid[y][x] = false;
			}
		}

		cells.forEach(cell => {
			const point = cell.transform.position.clone().divide(CELL_SIZE).floor();
			grid[point.y][point.x] = true;
			this.engine.renderer.text("X", (point.x * CELL_SIZE) + CELL_SIZE / 2 - 6, (point.y * CELL_SIZE) - 2, 255);
		});

		const checked = new Set<string>();
		cells.forEach(cell => {
			const toCheck = cell.getComponent(Cell).neighborPoints;
			toCheck.forEach(point => {
				const str = point.toString();
				if (!checked.has(str)) {
					checked.add(str);
					const gridPos = point.clone().divide(CELL_SIZE).floor();
					if (gridPos.x < 0 || gridPos.y < 0 || grid[gridPos.y][gridPos.x]) return;

					let count = 0;
					for (let y = -1; y <= 1; y++) {
						for (let x = -1; x <= 1; x++) {
							const tx = gridPos.x + x;
							const ty = gridPos.y + y;
							if (ty < 0 || tx < 0) continue;
							if (grid[ty][tx]) count++;
						}
					}

					if (count == 3) {
						this.createCellAtPoint(point);
					}
				}
			});
		});
	}

	private createCellAtPoint(point: Vector2) {
		const entity = this.engine.createEntity();
		entity.transform.position.set(point);
		createCell(entity);
		this.engine.emit("new_cell", entity);
	}

	private handleMouseDownSingle() {
		const point = this.getGridPoint();

		// Is there already a cell here?
		const cells = this.engine.getEntitiesWithComponent(Cell);
		const existingCell = cells.find(cell => cell.transform.position.equals(point));
		if (existingCell) {
			existingCell.destroy();
		} else {
			this.createCellAtPoint(point);
		}
	}

	private handleMouseDown() {
		const point = this.getGridPoint();
		const size = 5;
		const cells = this.engine.getEntitiesWithComponent(Cell);
		for (let y = -size; y < size; y++) {
			for (let x = -size; x < size; x++) {
				if (Math.random() < 0.5) continue;
				const newPoint = new Vector2(point.x + x * CELL_SIZE, point.y + y * CELL_SIZE);
				if (newPoint.x < 0 || newPoint.y < 0) continue;
				const existingCell = cells.find(cell => cell.transform.position.equals(newPoint));
				if (!existingCell) this.createCellAtPoint(newPoint);
			}
		}
	}

	public override update(dt: number): void {
		const gridAlign = this.getGridPoint();
		const renderer = this.engine.renderer;

		renderer.rect(
			gridAlign.x,
			gridAlign.y,
			CELL_SIZE,
			CELL_SIZE,
			[255, 255, 255, 100]
		);
		renderer.strokeWidth(2);
		renderer.strokeRect([0, 0, 0]);
		renderer.strokeWidth(1);
	}
}

export { WorldBackground, WorldInteractions };