import { isAppError } from "@/lib/errors";
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

    // Note: Currently only department-based assignment is supported
    // The 'criteria' field is validated but only 'department' is implemented
    if (body.criteria && body.criteria !== "department") {
      return createErrorResponse(
        "Only department-based assignment is currently supported",
        { status: 400 }
      );
    }

    // If dryRun is true, we'll return what would happen without making changes
    if (body.dryRun) {
      // For now, return a message indicating this is a dry run
      // In the future, this could show preview of assignments
      return createSuccessResponse(
        {
          success: true,
          message: "Dry run mode - no assignments were made",
          assigned: 0,
          dryRun: true,
        },
        {
          status: 200,
        }
      );
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
    });
  } catch (error) {
    // Handle custom application errors with appropriate status codes
    if (isAppError(error)) {
      return createErrorResponse(error.message, {
        status: error.statusCode,
        code: error.code,
      });
    }

    // Handle unexpected errors
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to perform auto-assignment",
      { status: 500 },
    );
  }
});
