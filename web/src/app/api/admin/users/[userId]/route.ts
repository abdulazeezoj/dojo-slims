import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { updateAdminSchema } from "@/schemas";
import { adminUserService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { userId: string } },
  ) => {
    try {
      const { userId } = context.params;
      const admin = await adminUserService.getAdminById(userId);

      if (!admin) {
        return createErrorResponse("Admin not found", { status: 404 });
      }

      return createSuccessResponse(admin);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load admin",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { userId: string } },
  ) => {
    try {
      const { userId } = context.params;
      const validation = await validateRequest(request, {
        body: updateAdminSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const admin = await adminUserService.updateAdmin(userId, body);

      return createSuccessResponse(admin, {
        message: "Admin updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update admin",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { userId: string } },
  ) => {
    try {
      const { userId } = context.params;
      
      // Prevent admin from deleting their own account
      if (userId === session.user.id) {
        return createErrorResponse(
          "Cannot delete your own admin account",
          { status: 403 },
        );
      }

      await adminUserService.deleteAdmin(userId);

      return createSuccessResponse(null, {
        message: "Admin deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete admin",
        { status: 500 },
      );
    }
  },
);
