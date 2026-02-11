import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { studentManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const body = await request.json();

    if (!Array.isArray(body.students)) {
      return createErrorResponse("Invalid request: students array required", {
        status: 400,
      });
    }

    const result = await studentManagementService.bulkCreateStudents(
      body.students,
    );

    return createSuccessResponse(result, {
      message: `Bulk upload completed: ${result.successful} successful, ${result.failed} failed`,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to bulk upload students",
      { status: 500 },
    );
  }
});
