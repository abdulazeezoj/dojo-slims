import { healthCheck } from "./health";

export const taskHandlers: Record<string, (data: any) => Promise<any>> = {
  "health.healthCheck": healthCheck,
};
