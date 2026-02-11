import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireSchoolSupervisor } from "@/lib/auth-server";
import { supervisorService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireSchoolSupervisor(
  async (request: NextRequest, session) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const dashboard =
        await supervisorService.getSchoolSupervisorDashboard(supervisorId);

      return createSuccessResponse(dashboard, {
        message: "Dashboard loaded successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load dashboard",
        { status: 500 },
      );
    }
  },
);
