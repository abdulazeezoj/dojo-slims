import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/lib/auth-server";
import { studentRepository } from "@/repositories";
import { logbookService, studentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    // Get student record from user ID
    const student = await studentRepository.findByUserId(session.user.id);
    if (!student) {
      return createErrorResponse("Student profile not found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    let sessionId = searchParams.get("sessionId");

    // If no sessionId provided, get it from student's current session
    if (!sessionId) {
      const dashboard = await studentService.getStudentDashboard(
        session.user.id,
      );
      sessionId = dashboard.activeSession?.id ?? null;

      if (!sessionId) {
        return createErrorResponse(
          "No active session found. Please enroll in a session first.",
          { status: 404 },
        );
      }
    }

    const weeks = await logbookService.getLogbookWeeks(student.id, sessionId);

    return createSuccessResponse(weeks);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load logbook",
      { status: 500 },
    );
  }
});
