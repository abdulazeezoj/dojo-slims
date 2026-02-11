import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { adminDashboardService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/admin/dashboard/metrics
 * Get system metrics for active sessions
 */
export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    const metrics = await adminDashboardService.getSystemMetrics();
    return createSuccessResponse(metrics);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch metrics",
      { status: 500 },
    );
  }
});
