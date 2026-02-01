import { requireStudent } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { logbookService } from "@/services";
import { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    const studentId = session.user.userReferenceId;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    const weeks = await logbookService.getLogbookWeeks(studentId, sessionId);

    return createSuccessResponse(weeks, {
      message: "Logbook loaded successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load logbook",
      { status: 500 },
    );
  }
});
