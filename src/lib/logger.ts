type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

function formatLog(payload: LogPayload): string {
  const { level, message, timestamp, context, error } = payload;
  const ctx = context ? ` | context=${JSON.stringify(context)}` : "";
  const err = error instanceof Error ? ` | error=${error.message}\n${error.stack}` : error ? ` | error=${JSON.stringify(error)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}${err}`;
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug(
        formatLog({
          level: "debug",
          message,
          timestamp: new Date().toISOString(),
          context,
        })
      );
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.info(
      formatLog({
        level: "info",
        message,
        timestamp: new Date().toISOString(),
        context,
      })
    );
  },

  warn(message: string, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.warn(
      formatLog({
        level: "warn",
        message,
        timestamp: new Date().toISOString(),
        context,
      })
    );
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.error(
      formatLog({
        level: "error",
        message,
        timestamp: new Date().toISOString(),
        context,
        error,
      })
    );
  },
};
