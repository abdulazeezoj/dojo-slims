import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/middlewares/auth";
import { createStudentSchema } from "@/schemas";
import { studentManagementService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");
    const searchTerm = searchParams.get("search") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;

    const result = await studentManagementService.getAllStudents({
      skip,
      take,
      searchTerm,
      departmentId,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load students",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const validation = await validateRequest(request, {
      body: createStudentSchema,
    });
    if (!validation.success) {return validation.error;}

    const { body } = validation.data;
    if (!body) {
      return createErrorResponse("Invalid request", { status: 400 });
    }

    const student = await studentManagementService.createStudent(body);

    return createSuccessResponse(student, {
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create student",
      { status: 500 },
    );
  }
});
