import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { updateDepartmentSchema } from "@/schemas";
import { departmentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { departmentId: string } },
  ) => {
    try {
      const { departmentId } = context.params;
      const department =
        await departmentService.getDepartmentById(departmentId);
      if (!department) {
        return createErrorResponse("Department not found", { status: 404 });
      }
      return createSuccessResponse(department);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load department",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { departmentId: string } },
  ) => {
    try {
      const { departmentId } = context.params;
      const validation = await validateRequest(request, {
        body: updateDepartmentSchema,
      });
      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const updated = await departmentService.updateDepartment(
        departmentId,
        body,
      );

      return createSuccessResponse(updated, {
        message: "Department updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update department",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { departmentId: string } },
  ) => {
    try {
      const { departmentId } = context.params;
      await departmentService.deleteDepartment(departmentId);

      return createSuccessResponse(null, {
        message: "Department deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete department",
        { status: 500 },
      );
    }
  },
);
