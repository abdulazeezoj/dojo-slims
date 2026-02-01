import { requireSchoolSupervisor } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { changePasswordSchema } from "@/schemas";
import { passwordService } from "@/services/password";
import { NextRequest } from "next/server";

export const POST = requireSchoolSupervisor(async (request: NextRequest, session) => {
  try {
    const validation = await validateRequest(request, {
      body: changePasswordSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;

    // Validate new password strength
    const strength = passwordService.validatePasswordStrength(body.newPassword);
    if (!strength.valid) {
      return createErrorResponse(strength.errors.join(", "), { status: 400 });
    }

    // Change password
    const result = await passwordService.changePassword(
      session.user.id,
      body.currentPassword,
      body.newPassword,
    );

    if (!result.success) {
      return createErrorResponse(result.message, { status: 400 });
    }

    return createSuccessResponse(null, {
      message: result.message,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to change password",
      { status: 500 },
    );
  }
});
