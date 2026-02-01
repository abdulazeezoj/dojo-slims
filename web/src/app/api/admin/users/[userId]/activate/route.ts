import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/middlewares/auth";
import { adminUserService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(
  async (request: NextRequest, session, context: { params: { userId: string } }) => {
    try {
      const { userId } = context.params;
      const admin = await adminUserService.activateAdmin(userId);

      return createSuccessResponse(admin, {
        message: "Admin activated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to activate admin",
        { status: 500 },
      );
    }
  },
);
