import { requireIndustrySupervisor } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { supervisorService } from "@/services";
import { NextRequest } from "next/server";

export const GET = requireIndustrySupervisor(async (request: NextRequest, session) => {
  try {
    const supervisorId = session.user.userReferenceId;
    const dashboard = await supervisorService.getIndustrySupervisorDashboard(supervisorId);

    return createSuccessResponse(dashboard, {
      message: "Dashboard loaded successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load dashboard",
      { status: 500 },
    );
  }
});
