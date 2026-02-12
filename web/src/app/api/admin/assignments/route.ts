import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { manualAssignmentSchema } from "@/schemas";
import { assignmentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    const assignments = await assignmentService.getAssignments(sessionId);
    return createSuccessResponse(assignments);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load assignments",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, {
      body: manualAssignmentSchema,
    });
    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    if (!body) {
      return createErrorResponse("Invalid request", { status: 400 });
    }

    // Use the authenticated session admin's ID instead of body.adminId
    const assignment = await assignmentService.manualAssignment(
      body.studentId!,
      body.schoolSupervisorId!,
      body.siwesSessionId!,
      session.user.id, // Use authenticated admin ID
    );

    return createSuccessResponse(assignment, {
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create assignment",
      { status: 500 },
    );
  }
});
