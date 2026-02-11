import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { supervisorManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { supervisorId: string } },
  ) => {
    try {
      const { supervisorId } = context.params;
      const supervisor =
        await supervisorManagementService.deactivateSupervisor(supervisorId);

      return createSuccessResponse(supervisor, {
        message: "Supervisor deactivated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error
          ? error.message
          : "Failed to deactivate supervisor",
        { status: 500 },
      );
    }
  },
);
