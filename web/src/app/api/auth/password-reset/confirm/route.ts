import { z } from "zod";

import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { passwordService } from "@/services/password";

import type { NextRequest } from "next/server";

const confirmResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * POST /api/auth/password-reset/confirm
 * Reset password using token
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequest(request, {
      body: confirmResetSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;

    // Validate password strength
    const strength = passwordService.validatePasswordStrength(body.newPassword);
    if (!strength.valid) {
      return createErrorResponse(strength.errors.join(", "), { status: 400 });
    }

    const result = await passwordService.resetPassword(body.token, body.newPassword);

    if (!result.success) {
      return createErrorResponse(result.message, { status: 400 });
    }

    return createSuccessResponse(null, {
      message: result.message,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to reset password",
      { status: 500 },
    );
  }
}
