import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireStudent } from "@/lib/auth-server";
import { updateStudentProfileSchema } from "@/schemas";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    // session.user.id is the Better Auth user ID, service will find student by userId
    const userId = session.user.id;
    const profile = await studentService.getStudentProfile(userId);

    if (!profile) {
      return createErrorResponse("Student profile not found", { status: 404 });
    }

    return createSuccessResponse(profile);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load profile",
      { status: 500 },
    );
  }
});

export const PATCH = requireStudent(async (request: NextRequest, session) => {
  try {
    // session.user.id is the Better Auth user ID, service will find student by userId
    const userId = session.user.id;
    const validation = await validateRequest(request, {
      body: updateStudentProfileSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const updated = await studentService.updateStudentProfile(userId, body!);

    return createSuccessResponse(updated);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to update profile",
      { status: 500 },
    );
  }
});
