import { requireStudent } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { logbookService } from "@/services";
import { NextRequest } from "next/server";

export const GET = requireStudent(
  async (request: NextRequest, session, context: { params: { weekId: string } }) => {
    try {
      const { weekId } = context.params;
      const week = await logbookService.getWeekDetails(weekId);

      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== session.user.userReferenceId) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      return createSuccessResponse(week);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load week",
        { status: 500 },
      );
    }
  },
);
