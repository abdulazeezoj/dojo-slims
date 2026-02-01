import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/middlewares/auth";
import { updateSessionSchema } from "@/schemas";
import { sessionService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (request: NextRequest, session, context: { params: { sessionId: string } }) => {
    try {
      const { sessionId } = context.params;
      const siwesSession = await sessionService.getSessionById(sessionId);
      if (!siwesSession) {
        return createErrorResponse("Session not found", { status: 404 });
      }
      return createSuccessResponse(siwesSession);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load session",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireAdmin(
  async (request: NextRequest, session, context: { params: { sessionId: string } }) => {
    try {
      const { sessionId } = context.params;
      const validation = await validateRequest(request, { body: updateSessionSchema });
      if (!validation.success) {return validation.error;}

      const { body } = validation.data;
      const updated = await sessionService.updateSession(sessionId, body);

      return createSuccessResponse(updated, {
        message: "Session updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update session",
        { status: 500 },
      );
    }
  },
);
