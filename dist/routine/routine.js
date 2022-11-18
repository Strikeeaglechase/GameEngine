class RoutineManager {
    constructor() {
        this.routines = [];
        this.coroutines = [];
    }
    update(dt) {
        this.routines.forEach(r => r.update(dt));
        this.coroutines.forEach(c => {
            if (!c.isAwaiting)
                this.runCoroutine(c);
        });
        this.coroutines = this.coroutines.filter(c => !c.isFinished);
    }
    start(routine) {
        this.routines.push(routine);
    }
    stop(routine) {
        this.routines = this.routines.filter(r => r !== routine);
    }
    startCoroutine(routine) {
        this.coroutines.push({
            generator: routine,
            isAwaiting: false,
            isFinished: false,
        });
    }
    runCoroutine(routine) {
        const result = routine.generator.next();
        // console.log(`Coro exec: `, routine, result);
        if (result.done) {
            routine.isFinished = true;
        }
        else if (result.value instanceof Promise) {
            routine.isAwaiting = true;
            result.value.then(() => {
                routine.isAwaiting = false;
            });
        }
    }
}
RoutineManager.instance = new RoutineManager();
class Routine {
    update(dt) {
        if (this.exitCondition && this.exitCondition()) {
            this.stop();
            return;
        }
    }
    ;
    stop() {
        RoutineManager.instance.stop(this);
    }
    setExitCondition(condition) {
        this.exitCondition = condition;
    }
    // Routine generators
    static every(delta, callback) {
        const r = new EveryRoutine(delta, callback);
        RoutineManager.instance.start(r);
        return r;
    }
    static while(condition, callback) {
        const r = new WhileRoutine(condition, callback);
        RoutineManager.instance.start(r);
        return r;
    }
    static until(condition, callback) {
        const r = new UntilRoutine(condition, callback);
        RoutineManager.instance.start(r);
        return r;
    }
    static once(condition, callback) {
        const r = new OnceRoutine(condition, callback);
        RoutineManager.instance.start(r);
        return r;
    }
    // Promise generators
    static wait(duration) {
        return new Promise(res => {
            setTimeout(() => res(), duration * 1000);
        });
    }
    static waitUntil(condition) {
        return new Promise(res => {
            Routine.once(condition, () => {
                res();
            });
        });
    }
    static waitForNextFrame() {
        return new Promise(res => res());
    }
    static waitForEvent(emitter, event) {
        return new Promise(res => {
            emitter.once(event, res);
        });
    }
    static startCoroutine(routine) {
        RoutineManager.instance.startCoroutine(routine);
        return routine;
    }
}
class EveryRoutine extends Routine {
    constructor(delta, callback) {
        super();
        this.delta = delta;
        this.callback = callback;
        this.lastRun = Date.now();
    }
    update(dt) {
        const timeFromLast = Date.now() - this.lastRun;
        if (timeFromLast >= this.delta) {
            this.callback();
            this.lastRun = Date.now();
        }
    }
}
class WhileRoutine extends Routine {
    constructor(condition, callback) {
        super();
        this.condition = condition;
        this.callback = callback;
    }
    update(dt) {
        if (this.condition()) {
            this.callback();
        }
    }
}
class UntilRoutine extends Routine {
    constructor(condition, callback) {
        super();
        this.condition = condition;
        this.callback = callback;
    }
    update(dt) {
        if (this.condition()) {
            this.stop();
        }
        else {
            this.callback();
        }
    }
}
class OnceRoutine extends Routine {
    constructor(condition, callback) {
        super();
        this.condition = condition;
        this.callback = callback;
    }
    update(dt) {
        if (this.condition()) {
            this.callback();
            this.stop();
        }
    }
}
export { RoutineManager, Routine, EveryRoutine, WhileRoutine, UntilRoutine, OnceRoutine };
