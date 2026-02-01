import { requireAdmin } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { studentManagementService } from "@/services";
import { NextRequest } from "next/server";

export const POST = requireAdmin(
  async (request: NextRequest, session, context: { params: { studentId: string } }) => {
    try {
      const { studentId } = context.params;
      const student = await studentManagementService.activateStudent(studentId);

      return createSuccessResponse(student, {
        message: "Student activated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to activate student",
        { status: 500 },
      );
    }
  },
);
