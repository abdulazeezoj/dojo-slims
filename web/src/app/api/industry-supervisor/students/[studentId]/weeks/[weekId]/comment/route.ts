import { requireIndustrySupervisor } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { reviewService } from "@/services";
import { addWeeklyCommentSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const POST = requireIndustrySupervisor(
  async (request: NextRequest, session, context: { params: { studentId: string; weekId: string } }) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const { weekId } = context.params;

      const validation = await validateRequest(request, {
        body: addWeeklyCommentSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;

      const result = await reviewService.addWeeklyComment(
        weekId,
        supervisorId,
        "INDUSTRY_SUPERVISOR",
        body.comment
      );

      return createSuccessResponse(result, {
        message: "Comment added and week locked successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to add comment",
        { status: 500 },
      );
    }
  },
);
