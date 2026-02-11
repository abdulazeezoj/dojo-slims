import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/lib/auth-server";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    const userId = session.user.id;
    const sessions = await studentService.getStudentSessions(userId);

    return createSuccessResponse(sessions);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load sessions",
      { status: 500 },
    );
  }
});
