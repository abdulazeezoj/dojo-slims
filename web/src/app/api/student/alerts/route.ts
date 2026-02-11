import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/lib/auth-server";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    // session.user.id is the Better Auth user ID, service will find student by userId
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || undefined;

    const dashboard = await studentService.getStudentDashboard(
      userId,
      sessionId,
    );

    // Return alerts array directly to match hook expectation
    return createSuccessResponse(dashboard.alerts);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load alerts",
      { status: 500 },
    );
  }
});
