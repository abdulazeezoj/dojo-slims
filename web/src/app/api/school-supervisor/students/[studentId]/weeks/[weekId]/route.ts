import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireSchoolSupervisor } from "@/lib/auth-server";
import { supervisorService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireSchoolSupervisor(
  async (
    request: NextRequest,
    session,
    context: { params: { studentId: string; weekId: string } },
  ) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const { studentId, weekId } = context.params;

      const week = await supervisorService.getStudentWeekForReview(
        weekId,
        studentId,
        supervisorId,
        "SCHOOL_SUPERVISOR",
      );

      if (!week) {
        return createErrorResponse("Week not found or not accessible", {
          status: 404,
        });
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
