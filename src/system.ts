import { GameEngine } from "./engine.js";
import { EventEmitter } from "./utils/eventEmitter.js";

abstract class System extends EventEmitter {
	public id: number;
	public isActive: boolean = false;
	protected engine: GameEngine;

	constructor() {
		super();
		this.id = GameEngine.getNextId();
		this.engine = GameEngine.instance;
	}

	public setup() {
		this.isActive = true;
	}
	public update(dt: number) { }
	public destroy() {
		this.isActive = false;
	}
}

export { System };