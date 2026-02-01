import { requireStudent } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { switchSessionSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const POST = requireStudent(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, {
      body: switchSessionSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;

    return createSuccessResponse(
      { sessionId: body.sessionId },
      {
        message: "Session switched successfully",
      },
    );
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to switch session",
      { status: 500 },
    );
  }
});
