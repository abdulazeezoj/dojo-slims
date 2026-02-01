import { requireAdmin } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { adminUserService } from "@/services";
import { NextRequest } from "next/server";

export const POST = requireAdmin(
  async (request: NextRequest, session, context: { params: { userId: string } }) => {
    try {
      const { userId } = context.params;
      const admin = await adminUserService.deactivateAdmin(userId);

      return createSuccessResponse(admin, {
        message: "Admin deactivated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to deactivate admin",
        { status: 500 },
      );
    }
  },
);
