import { EventEmitter } from "../utils/eventEmitter.js";

type Callback = () => void;
type Condition = () => boolean;

interface RunningCoroutine {
	generator: Generator;
	isAwaiting: boolean;
	isFinished: boolean;
}

class RoutineManager {
	private routines: Routine[] = [];
	private coroutines: RunningCoroutine[] = [];
	public static instance = new RoutineManager();

	public update(dt: number) {
		this.routines.forEach(r => r.update(dt));

		this.coroutines.forEach(c => {
			if (!c.isAwaiting) this.runCoroutine(c);
		});
		this.coroutines = this.coroutines.filter(c => !c.isFinished);
	}

	public start(routine: Routine) {
		this.routines.push(routine);
	}

	public stop(routine: Routine) {
		this.routines = this.routines.filter(r => r !== routine);
	}

	public startCoroutine(routine: Generator) {
		this.coroutines.push({
			generator: routine,
			isAwaiting: false,
			isFinished: false,
		});
	}

	public runCoroutine(routine: RunningCoroutine) {
		const result = routine.generator.next();
		// console.log(`Coro exec: `, routine, result);
		if (result.done) {
			routine.isFinished = true;
		} else if (result.value instanceof Promise) {
			routine.isAwaiting = true;
			result.value.then(() => {
				routine.isAwaiting = false;
			});
		}
	}
}


abstract class Routine {
	private exitCondition: Condition;

	public update(dt: number) {
		if (this.exitCondition && this.exitCondition()) {
			this.stop();
			return;
		}
	};

	public stop() {
		RoutineManager.instance.stop(this);
	}

	public setExitCondition(condition: Condition) {
		this.exitCondition = condition;
	}

	// Routine generators
	public static every(delta: number, callback: Callback): EveryRoutine {
		const r = new EveryRoutine(delta, callback);
		RoutineManager.instance.start(r);
		return r;
	}

	public static while(condition: Condition, callback: Callback): WhileRoutine {
		const r = new WhileRoutine(condition, callback);
		RoutineManager.instance.start(r);
		return r;
	}

	public static until(condition: Condition, callback: Callback): UntilRoutine {
		const r = new UntilRoutine(condition, callback);
		RoutineManager.instance.start(r);
		return r;
	}

	public static once(condition: Condition, callback: Callback): OnceRoutine {
		const r = new OnceRoutine(condition, callback);
		RoutineManager.instance.start(r);
		return r;
	}

	// Promise generators
	public static wait(duration: number): Promise<void> {
		return new Promise(res => {
			setTimeout(() => res(), duration * 1000);
		});
	}

	public static waitUntil(condition: Condition): Promise<void> {
		return new Promise(res => {
			Routine.once(condition, () => {
				res();
			});
		});
	}

	public static waitForNextFrame(): Promise<void> {
		return new Promise(res => res());
	}

	public static waitForEvent<T extends string>(emitter: EventEmitter<T>, event: T): Promise<any> {
		return new Promise<void>(res => {
			emitter.once(event, res);
		});
	}

	public static startCoroutine(routine: Generator) {
		RoutineManager.instance.startCoroutine(routine);
		return routine;
	}
}

class EveryRoutine extends Routine {
	private lastRun: number = Date.now();
	constructor(private delta: number, private callback: Callback) {
		super();
	}

	public override update(dt: number) {
		const timeFromLast = Date.now() - this.lastRun;
		if (timeFromLast >= this.delta) {
			this.callback();
			this.lastRun = Date.now();
		}
	}
}

class WhileRoutine extends Routine {
	constructor(private condition: Condition, private callback: Callback) {
		super();
	}

	public override update(dt: number) {
		if (this.condition()) {
			this.callback();
		}
	}
}

class UntilRoutine extends Routine {
	constructor(private condition: Condition, private callback: Callback) {
		super();
	}

	public override update(dt: number) {
		if (this.condition()) {
			this.stop();
		} else {
			this.callback();
		}
	}
}

class OnceRoutine extends Routine {
	constructor(private condition: Condition, private callback: Callback) {
		super();
	}

	public override update(dt: number) {
		if (this.condition()) {
			this.callback();
			this.stop();
		}
	}
}

export { RoutineManager, Routine, EveryRoutine, WhileRoutine, UntilRoutine, OnceRoutine };