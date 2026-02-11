import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { updateSchoolSupervisorSchema } from "@/schemas";
import { supervisorManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { supervisorId: string } },
  ) => {
    try {
      const { supervisorId } = context.params;
      const supervisor =
        await supervisorManagementService.getSupervisorById(supervisorId);

      if (!supervisor) {
        return createErrorResponse("Supervisor not found", { status: 404 });
      }

      return createSuccessResponse(supervisor);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load supervisor",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { supervisorId: string } },
  ) => {
    try {
      const { supervisorId } = context.params;
      const validation = await validateRequest(request, {
        body: updateSchoolSupervisorSchema,
      });
      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const updated = await supervisorManagementService.updateSupervisor(
        supervisorId,
        body,
      );

      return createSuccessResponse(updated, {
        message: "Supervisor updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update supervisor",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { supervisorId: string } },
  ) => {
    try {
      const { supervisorId } = context.params;
      await supervisorManagementService.deleteSupervisor(supervisorId);

      return createSuccessResponse(null, {
        message: "Supervisor deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete supervisor",
        { status: 500 },
      );
    }
  },
);
