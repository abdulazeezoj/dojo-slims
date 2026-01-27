import {
  configure,
  getConsoleSink,
  getJsonLinesFormatter,
  getTextFormatter,
  type LogLevel,
} from "@logtape/logtape";
import { clientConfig } from "./config-client";

let isConfigured = false;

const isDevelopment = process.env.NODE_ENV === "development";

export async function configureLogger() {
  if (isConfigured) return;

  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: isDevelopment
          ? getTextFormatter({
              timestamp: "date-time",
              level: "FULL",
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
        lowestLevel: clientConfig.LOG_LEVEL as LogLevel,
        sinks: ["console"],
      },
    ],
  });

  isConfigured = true;
}

// Auto-configure on client
configureLogger();

export { getLogger } from "@logtape/logtape";
