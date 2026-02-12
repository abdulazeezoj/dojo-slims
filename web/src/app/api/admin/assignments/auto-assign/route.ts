import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { autoAssignmentSchema } from "@/schemas/admin";
import { assignmentService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, {
      body: autoAssignmentSchema,
    });
    
    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    
    if (!body) {
      return createErrorResponse("Invalid request", { status: 400 });
    }

    // Perform auto-assignment using the session admin ID
    const result = await assignmentService.autoAssignByDepartment(
      body.siwesSessionId,
      session.user.id, // Use the authenticated admin's ID
      {
        maxStudentsPerSupervisor: 10, // Default value, can be made configurable
      },
    );

    return createSuccessResponse(result, {
      status: 201,
      message: result.message || "Auto-assignment completed successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to perform auto-assignment",
      { status: 500 },
    );
  }
});
