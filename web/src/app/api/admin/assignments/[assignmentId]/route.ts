import { requireAdmin } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { assignmentService } from "@/services";
import { NextRequest } from "next/server";

export const DELETE = requireAdmin(
  async (request: NextRequest, session, context: { params: { assignmentId: string } }) => {
    try {
      const { assignmentId } = context.params;
      await assignmentService.removeAssignment(assignmentId);

      return createSuccessResponse(null, {
        message: "Assignment removed successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to remove assignment",
        { status: 500 },
      );
    }
  },
);
