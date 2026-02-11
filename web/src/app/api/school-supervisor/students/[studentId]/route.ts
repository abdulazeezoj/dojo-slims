import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireSchoolSupervisor } from "@/lib/auth-server";
import { supervisorService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireSchoolSupervisor(
  async (
    request: NextRequest,
    session,
    context: { params: { studentId: string } },
  ) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const { studentId } = context.params;

      const student = await supervisorService.getStudentDetails(
        studentId,
        supervisorId,
        "SCHOOL_SUPERVISOR",
      );

      if (!student) {
        return createErrorResponse("Student not found or not assigned", {
          status: 404,
        });
      }

      return createSuccessResponse(student);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load student",
        { status: 500 },
      );
    }
  },
);
