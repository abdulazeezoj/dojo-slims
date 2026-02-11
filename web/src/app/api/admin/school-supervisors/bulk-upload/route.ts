import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { supervisorManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const body = await request.json();

    if (!Array.isArray(body.supervisors)) {
      return createErrorResponse(
        "Invalid request: supervisors array required",
        { status: 400 },
      );
    }

    const result = await supervisorManagementService.bulkCreateSupervisors(
      body.supervisors,
    );

    return createSuccessResponse(result, {
      message: `Bulk upload completed: ${result.successful} successful, ${result.failed} failed`,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error
        ? error.message
        : "Failed to bulk upload supervisors",
      { status: 500 },
    );
  }
});
