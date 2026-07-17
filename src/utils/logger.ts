/**
 * Structured logging utility for consistent error and warning logging across the application.
 * Logs include timestamp, severity level, and contextual information.
 */

interface LogContext {
	[key: string]: unknown;
}

class Logger {
	error(message: string, error?: Error | unknown, context?: LogContext): void {
		const timestamp = new Date().toISOString();
		const errorDetails =
			error instanceof Error
				? { name: error.name, message: error.message, stack: error.stack }
				: { value: String(error) };

		console.error(
			JSON.stringify({
				timestamp,
				level: "ERROR",
				message,
				error: errorDetails,
				context,
			}),
		);
	}

	warn(message: string, context?: LogContext): void {
		const timestamp = new Date().toISOString();
		console.warn(
			JSON.stringify({
				timestamp,
				level: "WARN",
				message,
				context,
			}),
		);
	}

	info(message: string, context?: LogContext): void {
		const timestamp = new Date().toISOString();
		console.info(
			JSON.stringify({
				timestamp,
				level: "INFO",
				message,
				context,
			}),
		);
	}
}

export const logger = new Logger();
