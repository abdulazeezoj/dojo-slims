
import { apiResponse } from "@/lib/api-response";
import { requireAuth } from "@/middlewares/auth";
import { adminDashboardService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/admin/dashboard/metrics
 * Get system metrics for active sessions
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ["ADMIN"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const metrics = await adminDashboardService.getSystemMetrics();
    return apiResponse.success(
      metrics,
      "System metrics retrieved successfully",
    );
  } catch (error) {
    return apiResponse.error(
      error instanceof Error ? error.message : "Failed to fetch metrics",
    );
  }
}
