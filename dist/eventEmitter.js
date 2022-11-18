class EventHandler {
    constructor(handler, once) {
        this.handler = handler;
        this.once = once;
        this.shouldExist = true;
    }
    execute(args) {
        if (!this.shouldExist || (this.disableWhenHandler && this.disableWhenHandler())) {
            this.shouldExist = false;
            return;
        }
        if (this.context) {
            this.handler.apply(this.context, args);
        }
        else {
            this.handler(...args);
        }
        if (this.once)
            this.shouldExist = false;
    }
    disableWhen(handler) {
        this.disableWhenHandler = handler;
        return this;
    }
    disable() {
        this.shouldExist = false;
        return this;
    }
    setContext(context) {
        this.context = context;
        return this;
    }
}
class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(event, listener) {
        if (!this.listeners[event])
            this.listeners[event] = [];
        const handler = new EventHandler(listener, false);
        this.listeners[event].push(handler);
        return handler;
    }
    once(event, listener) {
        if (!this.listeners[event])
            this.listeners[event] = [];
        const handler = new EventHandler(listener, true);
        this.listeners[event].push(handler);
        return handler;
    }
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((listener) => {
                listener.execute(args);
            });
            this.listeners[event] = this.listeners[event].filter(listener => listener.shouldExist);
        }
    }
}
export { EventEmitter, EventHandler };
