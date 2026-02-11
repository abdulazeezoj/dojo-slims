import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { enrollmentService } from "@/services";

import type { NextRequest } from "next/server";

export const DELETE = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { enrollmentId: string } },
  ) => {
    try {
      const { enrollmentId } = context.params;
      await enrollmentService.removeEnrollment(enrollmentId);

      return createSuccessResponse(null, {
        message: "Enrollment removed successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to remove enrollment",
        { status: 500 },
      );
    }
  },
);
