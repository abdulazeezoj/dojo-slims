import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireSchoolSupervisor } from "@/middlewares/auth";
import { addFinalCommentSchema } from "@/schemas";
import { reviewService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireSchoolSupervisor(
  async (request: NextRequest, session, context: { params: { studentId: string } }) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const { studentId } = context.params;

      const validation = await validateRequest(request, {
        body: addFinalCommentSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get("sessionId");

      if (!sessionId) {
        return createErrorResponse("Session ID is required", { status: 400 });
      }

      const result = await reviewService.addFinalComment(
        studentId,
        sessionId,
        supervisorId,
        "SCHOOL_SUPERVISOR",
        body.comment,
        body.rating
      );

      return createSuccessResponse(result, {
        message: "Final comment submitted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to submit final comment",
        { status: 500 },
      );
    }
  },
);
