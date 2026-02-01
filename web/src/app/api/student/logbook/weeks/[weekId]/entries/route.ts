import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireStudent } from "@/middlewares/auth";
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
      const { weekId } = context.params;
      const validation = await validateRequest(request, {
        body: weekEntryContentSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const week = await logbookService.getWeekDetails(weekId);

      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== session.user.userReferenceId) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      const updated = await logbookService.upsertWeekEntry(
        weekId,
        body.day,
        body.content,
      );

      return createSuccessResponse(updated, {
        message: "Entry saved successfully",
      });
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

      if (week.studentId !== session.user.userReferenceId) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      const updated = await logbookService.deleteWeekEntry(
        weekId,
        day as
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday"
          | "sunday",
      );

      return createSuccessResponse(updated, {
        message: "Entry deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete entry",
        { status: 500 },
      );
    }
  },
);
