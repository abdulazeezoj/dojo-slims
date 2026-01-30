import {
  configure,
  getConsoleSink,
  getJsonLinesFormatter,
  getTextFormatter,
  type LogLevel,
} from "@logtape/logtape";
import { config } from "./config";

let isConfigured = false;

/**
 * Configure server-side logger with appropriate formatter
 */
export async function configureLogger() {
  if (isConfigured) return;

  const isDevelopment = config.NODE_ENV === "development";

  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: isDevelopment
          ? getTextFormatter({
              timestamp: "date-time",
              level: "FULL",
              category: ".",
            })
          : getJsonLinesFormatter({
              message: "rendered",
            }),
      }),
    },
    filters: {},
    loggers: [
      {
        category: ["logtape", "meta"],
        sinks: ["console"],
        lowestLevel: "warning",
      },
      {
        category: [],
        lowestLevel: config.LOG_LEVEL as LogLevel,
        sinks: ["console"],
      },
    ],
  });

  isConfigured = true;
}

configureLogger();

export { getLogger } from "@logtape/logtape";
