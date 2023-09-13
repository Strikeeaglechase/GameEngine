import { EventEmitter } from "../utils/eventEmitter.js";
declare type Callback = () => void;
declare type Condition = () => boolean;
interface RunningCoroutine {
    generator: Generator;
    isAwaiting: boolean;
    isFinished: boolean;
}
declare class RoutineManager {
    private routines;
    private coroutines;
    static instance: RoutineManager;
    update(dt: number): void;
    start(routine: Routine): void;
    stop(routine: Routine): void;
    startCoroutine(routine: Generator): void;
    runCoroutine(routine: RunningCoroutine): void;
}
declare abstract class Routine {
    private exitCondition;
    update(dt: number): void;
    stop(): void;
    setExitCondition(condition: Condition): void;
    static every(delta: number, callback: Callback): EveryRoutine;
    static while(condition: Condition, callback: Callback): WhileRoutine;
    static until(condition: Condition, callback: Callback): UntilRoutine;
    static once(condition: Condition, callback: Callback): OnceRoutine;
    static wait(duration: number): Promise<void>;
    static waitUntil(condition: Condition): Promise<void>;
    static waitForNextFrame(): Promise<void>;
    static waitForEvent<T extends string>(emitter: EventEmitter<T>, event: T): Promise<any>;
    static startCoroutine(routine: Generator): Generator<unknown, any, unknown>;
}
declare class EveryRoutine extends Routine {
    private delta;
    private callback;
    private lastRun;
    constructor(delta: number, callback: Callback);
    update(dt: number): void;
}
declare class WhileRoutine extends Routine {
    private condition;
    private callback;
    constructor(condition: Condition, callback: Callback);
    update(dt: number): void;
}
declare class UntilRoutine extends Routine {
    private condition;
    private callback;
    constructor(condition: Condition, callback: Callback);
    update(dt: number): void;
}
declare class OnceRoutine extends Routine {
    private condition;
    private callback;
    constructor(condition: Condition, callback: Callback);
    update(dt: number): void;
}
export { RoutineManager, Routine, EveryRoutine, WhileRoutine, UntilRoutine, OnceRoutine };
