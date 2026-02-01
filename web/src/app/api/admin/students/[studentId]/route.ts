import { requireAdmin } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { studentManagementService } from "@/services";
import { updateStudentSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (request: NextRequest, session, context: { params: { studentId: string } }) => {
    try {
      const { studentId } = context.params;
      const student = await studentManagementService.getStudentById(studentId);

      if (!student) {
        return createErrorResponse("Student not found", { status: 404 });
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

export const PATCH = requireAdmin(
  async (request: NextRequest, session, context: { params: { studentId: string } }) => {
    try {
      const { studentId } = context.params;
      const validation = await validateRequest(request, { body: updateStudentSchema });
      if (!validation.success) return validation.error;

      const { body } = validation.data;
      const updated = await studentManagementService.updateStudent(studentId, body);

      return createSuccessResponse(updated, {
        message: "Student updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update student",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireAdmin(
  async (request: NextRequest, session, context: { params: { studentId: string } }) => {
    try {
      const { studentId } = context.params;
      await studentManagementService.deleteStudent(studentId);

      return createSuccessResponse(null, {
        message: "Student deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete student",
        { status: 500 },
      );
    }
  },
);
