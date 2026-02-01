import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/middlewares/auth";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/student/dashboard
 * Get student dashboard with session information and alerts
 */
export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    const studentId = session.user.userReferenceId;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || undefined;

    const dashboard = await studentService.getStudentDashboard(studentId, sessionId);

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
