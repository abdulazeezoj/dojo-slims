import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { closeSessionSchema } from "@/schemas";
import { sessionService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(
  async (
    request: NextRequest,
    session,
    context: { params: { sessionId: string } },
  ) => {
    try {
      const { sessionId } = context.params;
      const validation = await validateRequest(request, {
        body: closeSessionSchema.optional(),
      });
      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const closed = await sessionService.closeSession(sessionId, body?.reason);

      return createSuccessResponse(closed, {
        message: "Session closed successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to close session",
        { status: 500 },
      );
    }
  },
);
