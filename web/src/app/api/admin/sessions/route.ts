import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { createSessionSchema } from "@/schemas";
import { sessionService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    const sessions = await sessionService.getAllSessions();
    return createSuccessResponse(sessions);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load sessions",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const validation = await validateRequest(request, {
      body: createSessionSchema,
    });
    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const newSession = await sessionService.createSession(body);

    return createSuccessResponse(newSession, {
      message: "Session created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create session",
      { status: 500 },
    );
  }
});
