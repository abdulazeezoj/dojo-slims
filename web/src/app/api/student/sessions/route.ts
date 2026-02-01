import { requireStudent } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { studentService } from "@/services";
import { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    const studentId = session.user.userReferenceId;
    const sessions = await studentService.getStudentSessions(studentId);

    return createSuccessResponse(sessions, {
      message: "Sessions loaded successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load sessions",
      { status: 500 },
    );
  }
});
