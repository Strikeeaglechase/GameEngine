class Logger {
    static debug(...args) {
        console.log(...args);
    }
    static info(...args) {
        console.log(...args);
    }
    static warn(...args) {
        console.warn(...args);
    }
    static error(...args) {
        console.error(...args);
    }
}
export { Logger };
