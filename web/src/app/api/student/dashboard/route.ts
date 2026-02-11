import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/lib/auth-server";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/student/dashboard
 * Get student dashboard with session information and alerts
 * @feature #5 Student Dashboard with Session Switching & Alerts
 */
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

    return createSuccessResponse(dashboard);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load dashboard",
      { status: 500 },
    );
  }
});
