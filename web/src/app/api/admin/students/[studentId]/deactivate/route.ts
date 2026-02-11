import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { studentManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { studentId: string } },
  ) => {
    try {
      const { studentId } = context.params;
      const student =
        await studentManagementService.deactivateStudent(studentId);

      return createSuccessResponse(student, {
        message: "Student deactivated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to deactivate student",
        { status: 500 },
      );
    }
  },
);
