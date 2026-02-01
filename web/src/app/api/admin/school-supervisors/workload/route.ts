import { requireAdmin } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { supervisorManagementService } from "@/services";
import { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const sessionId = searchParams.get("sessionId") || undefined;

    const workload = await supervisorManagementService.getSupervisorWorkload({
      departmentId,
      sessionId,
    });

    return createSuccessResponse(workload);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load workload report",
      { status: 500 },
    );
  }
});
