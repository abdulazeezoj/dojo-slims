import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { createSchoolSupervisorSchema } from "@/schemas";
import { supervisorManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");
    const searchTerm = searchParams.get("search") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;

    const result = await supervisorManagementService.getAllSupervisors({
      skip,
      take,
      searchTerm,
      departmentId,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load supervisors",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const validation = await validateRequest(request, {
      body: createSchoolSupervisorSchema,
    });
    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const supervisor = await supervisorManagementService.createSupervisor(body);

    return createSuccessResponse(supervisor, {
      message: "Supervisor created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create supervisor",
      { status: 500 },
    );
  }
});
