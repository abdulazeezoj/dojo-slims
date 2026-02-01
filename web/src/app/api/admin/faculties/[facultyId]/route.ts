import { requireAdmin } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { facultyService } from "@/services";
import { updateFacultySchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (request: NextRequest, session, context: { params: { facultyId: string } }) => {
    try {
      const { facultyId } = context.params;
      const faculty = await facultyService.getFacultyById(facultyId);
      if (!faculty) {
        return createErrorResponse("Faculty not found", { status: 404 });
      }
      return createSuccessResponse(faculty);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load faculty",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireAdmin(
  async (request: NextRequest, session, context: { params: { facultyId: string } }) => {
    try {
      const { facultyId } = context.params;
      const validation = await validateRequest(request, { body: updateFacultySchema });
      if (!validation.success) return validation.error;

      const { body } = validation.data;
      const updated = await facultyService.updateFaculty(facultyId, body);

      return createSuccessResponse(updated, {
        message: "Faculty updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update faculty",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireAdmin(
  async (request: NextRequest, session, context: { params: { facultyId: string } }) => {
    try {
      const { facultyId } = context.params;
      await facultyService.deleteFaculty(facultyId);

      return createSuccessResponse(null, {
        message: "Faculty deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete faculty",
        { status: 500 },
      );
    }
  },
);
