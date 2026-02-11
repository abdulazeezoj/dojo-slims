import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireSchoolSupervisor } from "@/lib/auth-server";
import { lockWeekSchema } from "@/schemas";
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

      const validation = await validateRequest(request, {
        body: lockWeekSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;

      const result = await reviewService.lockWeek(
        weekId,
        supervisorId,
        body.reason,
      );

      return createSuccessResponse(result, {
        message: "Week locked successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to lock week",
        { status: 500 },
      );
    }
  },
);
