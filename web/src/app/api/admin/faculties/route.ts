import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { createFacultySchema } from "@/schemas";
import { facultyService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    const faculties = await facultyService.getAllFaculties();
    return createSuccessResponse(faculties);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load faculties",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const validation = await validateRequest(request, {
      body: createFacultySchema,
    });
    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const faculty = await facultyService.createFaculty(body);

    return createSuccessResponse(faculty, {
      message: "Faculty created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create faculty",
      { status: 500 },
    );
  }
});
