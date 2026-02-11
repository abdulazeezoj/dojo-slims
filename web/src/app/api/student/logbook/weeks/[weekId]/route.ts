import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/lib/auth-server";
import { studentRepository } from "@/repositories";
import { logbookService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireStudent(
  async (
    request: NextRequest,
    session,
    context: { params: { weekId: string } },
  ) => {
    try {
      // Get student record from user ID
      const student = await studentRepository.findByUserId(session.user.id);
      if (!student) {
        return createErrorResponse("Student profile not found", {
          status: 404,
        });
      }

      const { weekId } = context.params;
      const week = await logbookService.getWeekDetails(weekId);

      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== student.id) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      return createSuccessResponse(week);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load week",
        { status: 500 },
      );
    }
  },
);
