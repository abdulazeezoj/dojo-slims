import { requireAdmin } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { departmentService } from "@/services";
import { createDepartmentSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId") || undefined;

    const departments = await departmentService.getAllDepartments(facultyId);
    return createSuccessResponse(departments);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load departments",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, { body: createDepartmentSchema });
    if (!validation.success) return validation.error;

    const { body } = validation.data;
    const department = await departmentService.createDepartment(body);

    return createSuccessResponse(department, {
      message: "Department created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create department",
      { status: 500 },
    );
  }
});
