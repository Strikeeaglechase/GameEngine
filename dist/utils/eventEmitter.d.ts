declare class EventHandler {
    private handler;
    private once;
    disableWhenHandler: () => boolean;
    shouldExist: boolean;
    private context;
    constructor(handler: Function, once: boolean);
    execute(args: any[]): void;
    disableWhen(handler: () => boolean): this;
    disable(): this;
    setContext(context: any): this;
}
declare class EventEmitter<T extends string = string> {
    listeners: Record<string, EventHandler[]>;
    on(event: T, listener: Function): EventHandler;
    once(event: T, listener: Function): EventHandler;
    emit(event: T, ...args: any[]): void;
}
export { EventEmitter, EventHandler };
