import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/middlewares/auth";
import { adminDashboardService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || undefined;

    const dashboard = await adminDashboardService.getDashboardStats(sessionId);

    return createSuccessResponse(dashboard, {
      message: "Dashboard loaded successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load dashboard",
      { status: 500 },
    );
  }
});
