import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireSchoolSupervisor } from "@/lib/auth-server";
import { reviewService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireSchoolSupervisor(
  async (
    request: NextRequest,
    session,
    context: { params: { studentId: string; weekId: string } },
  ) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const { weekId } = context.params;

      const result = await reviewService.unlockWeek(weekId, supervisorId);

      return createSuccessResponse(result, {
        message: "Week unlocked successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to unlock week",
        { status: 500 },
      );
    }
  },
);
