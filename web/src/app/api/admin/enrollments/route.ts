import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/middlewares/auth";
import { enrollmentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    const enrollments =
      await enrollmentService.getSessionEnrollments(sessionId);
    return createSuccessResponse(enrollments);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load enrollments",
      { status: 500 },
    );
  }
});
