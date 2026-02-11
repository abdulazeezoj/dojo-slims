import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { adminDashboardService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    const dashboard = await adminDashboardService.getDashboardStats();

    return createSuccessResponse(dashboard, {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load dashboard",
      { status: 500 },
    );
  }
});
