import { GameEngine } from "./engine.js";
import { EventEmitter } from "./utils/eventEmitter.js";
class System extends EventEmitter {
    constructor() {
        super();
        this.isActive = false;
        this.id = GameEngine.getNextId();
        this.engine = GameEngine.instance;
    }
    setup() {
        this.isActive = true;
    }
    update(dt) { }
    destroy() {
        this.isActive = false;
    }
}
export { System };
