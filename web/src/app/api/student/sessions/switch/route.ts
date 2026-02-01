import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireStudent } from "@/middlewares/auth";
import { switchSessionSchema } from "@/schemas";

import type { NextRequest } from "next/server";

export const POST = requireStudent(async (request: NextRequest, _session) => {
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
