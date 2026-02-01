import { requireAdmin } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { assignmentService } from "@/services";
import { manualAssignmentSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, session) => {
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
    const validation = await validateRequest(request, { body: manualAssignmentSchema });
    if (!validation.success) return validation.error;

    const { body } = validation.data;
    const assignment = await assignmentService.manualAssign(body);

    return createSuccessResponse(assignment, {
      message: "Assignment created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create assignment",
      { status: 500 },
    );
  }
});
