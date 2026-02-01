import { healthCheck } from "./health";

export const taskHandlers: Record<string, (data: unknown) => Promise<unknown>> =
  {
    "health.healthCheck": healthCheck,
  };
