import { z } from "zod";

import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { passwordService } from "@/services/password";

import type { NextRequest } from "next/server";

const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/auth/password-reset
 * Request password reset link
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequest(request, {
      body: requestResetSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;

    const result = await passwordService.requestPasswordReset(body.email);

    return createSuccessResponse(null, {
      message: result.message,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to process request",
      { status: 500 },
    );
  }
}
