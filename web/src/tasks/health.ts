import * as healthService from "@/services/health";

export type HealthCheckData = Record<string, never>;

export interface HealthCheckResult {
  status: string;
  timestamp: string;
  version: string;
}

export async function healthCheck(): Promise<HealthCheckResult> {
  const result = await healthService.healthCheck();
  return result;
}
