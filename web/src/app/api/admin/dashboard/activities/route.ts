import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { adminDashboardService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/admin/dashboard/activities
 * Get recent system activities
 */
export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "20");

    const activities = await adminDashboardService.getRecentActivities(limit);
    return createSuccessResponse(activities);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch activities",
      { status: 500 },
    );
  }
});
