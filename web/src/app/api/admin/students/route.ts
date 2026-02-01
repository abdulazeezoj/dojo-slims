import { requireAdmin } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { studentManagementService } from "@/services";
import { createStudentSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, session) => {
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

export const POST = requireAdmin(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, { body: createStudentSchema });
    if (!validation.success) return validation.error;

    const { body } = validation.data;
    const student = await studentManagementService.createStudent(body);

    return createSuccessResponse(student, {
      message: "Student created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create student",
      { status: 500 },
    );
  }
});
