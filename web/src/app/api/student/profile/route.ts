import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireStudent } from "@/middlewares/auth";
import { updateStudentProfileSchema } from "@/schemas";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    const studentId = session.user.userReferenceId;
    const profile = await studentService.getStudentProfile(studentId);

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
    const studentId = session.user.userReferenceId;
    const validation = await validateRequest(request, {
      body: updateStudentProfileSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const updated = await studentService.updateStudentProfile(studentId, body);

    return createSuccessResponse(updated, {
      message: "Profile updated successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to update profile",
      { status: 500 },
    );
  }
});
