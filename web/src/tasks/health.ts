import * as healthService from "@/services/health";

export interface HealthCheckData {}

export interface HealthCheckResult {
  status: string;
  timestamp: string;
  version: string;
}

export async function healthCheck(
  data: HealthCheckData,
): Promise<HealthCheckResult> {
  const result = await healthService.healthCheck();
  return result;
}
