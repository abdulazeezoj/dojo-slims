import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { assignmentService } from "@/services";

import type { NextRequest } from "next/server";

export const DELETE = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: {
      params: Promise<{
        studentId: string;
        supervisorId: string;
        sessionId: string;
      }>;
    },
  ) => {
    try {
      const { studentId, supervisorId, sessionId } = await context.params;
      const result = await assignmentService.unassignStudent(
        studentId,
        supervisorId,
        sessionId,
      );

      return createSuccessResponse(result, {
        status: 200,
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to remove assignment",
        { status: 500 },
      );
    }
  },
);
