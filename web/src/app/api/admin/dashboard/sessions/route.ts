import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { adminDashboardService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/admin/dashboard/sessions
 * Get active sessions with enrollment counts
 */
export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    const sessions = await adminDashboardService.getActiveSessions();
    return createSuccessResponse(sessions);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch sessions",
      { status: 500 },
    );
  }
});
