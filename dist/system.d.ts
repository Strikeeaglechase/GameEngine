import { GameEngine } from "./engine.js";
import { EventEmitter } from "./utils/eventEmitter.js";
declare abstract class System extends EventEmitter {
    id: number;
    isActive: boolean;
    protected engine: GameEngine;
    constructor();
    setup(): void;
    update(dt: number): void;
    destroy(): void;
}
export { System };
