class Logger {
	public static debug(...args: any[]) {
		console.log(...args);
	}
	public static info(...args: any[]) {
		console.log(...args);
	}

	public static warn(...args: any[]) {
		console.warn(...args);
	}

	public static error(...args: any[]) {
		console.error(...args);
	}
}

export { Logger };