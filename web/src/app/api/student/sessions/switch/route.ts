import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireStudent } from "@/lib/auth-server";
import { switchSessionSchema } from "@/schemas";
import { studentService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireStudent(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, {
      body: switchSessionSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;

    if (!body) {
      return createErrorResponse("Request body is required", { status: 400 });
    }

    // Persist the session selection to database
    await studentService.setCurrentSession(session.user.id, body.sessionId);

    return createSuccessResponse(
      { sessionId: body.sessionId },
      {
        status: 200,
      },
    );
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to switch session",
      { status: 500 },
    );
  }
});
