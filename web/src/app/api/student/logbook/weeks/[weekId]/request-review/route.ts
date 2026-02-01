import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/middlewares/auth";
import { logbookService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireStudent(
  async (request: NextRequest, session, context: { params: { weekId: string } }) => {
    try {
      const { weekId } = context.params;
      const studentId = session.user.userReferenceId;
      
      const week = await logbookService.getWeekDetails(weekId);
      
      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== studentId) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      const result = await logbookService.requestWeekReview(weekId, studentId);

      return createSuccessResponse(result, {
        message: "Review request sent to industry supervisor",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to request review",
        { status: 500 },
      );
    }
  },
);
