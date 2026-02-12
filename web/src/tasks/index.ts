import { healthCheck } from "./health";
import { cleanupExports } from "./cleanup-exports";

export const taskHandlers: Record<string, (data: unknown) => Promise<unknown>> =
  {
    "health.healthCheck": healthCheck,
    "exports.cleanup": cleanupExports,
  };
