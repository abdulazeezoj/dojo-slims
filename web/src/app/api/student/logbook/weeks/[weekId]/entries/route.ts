import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireStudent } from "@/lib/auth-server";
import { studentRepository } from "@/repositories";
import { weekEntryContentSchema } from "@/schemas";
import { logbookService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireStudent(
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
      const validation = await validateRequest(request, {
        body: weekEntryContentSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      if (!body) {
        return createErrorResponse("Request body is required", { status: 400 });
      }

      const week = await logbookService.getWeekDetails(weekId);

      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== student.id) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      const updated = await logbookService.upsertWeekEntry(
        weekId,
        student.id,
        body.day,
        body.content,
      );

      return createSuccessResponse(updated);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to save entry",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireStudent(
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
      const { searchParams } = new URL(request.url);
      const day = searchParams.get("day");

      if (!day) {
        return createErrorResponse("Day parameter is required", {
          status: 400,
        });
      }

      const week = await logbookService.getWeekDetails(weekId);

      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== student.id) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      const updated = await logbookService.deleteWeekEntry(
        weekId,
        student.id,
        day as
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday",
      );

      return createSuccessResponse(updated);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete entry",
        { status: 500 },
      );
    }
  },
);
