import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireSchoolSupervisor } from "@/lib/auth-server";
import { updateSchoolSupervisorProfileSchema } from "@/schemas";
import { supervisorService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireSchoolSupervisor(
  async (request: NextRequest, session) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const profile =
        await supervisorService.getSchoolSupervisorProfile(supervisorId);

      if (!profile) {
        return createErrorResponse("Profile not found", { status: 404 });
      }

      return createSuccessResponse(profile);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load profile",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireSchoolSupervisor(
  async (request: NextRequest, session) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const validation = await validateRequest(request, {
        body: updateSchoolSupervisorProfileSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const updated = await supervisorService.updateSchoolSupervisorProfile(
        supervisorId,
        body,
      );

      return createSuccessResponse(updated, {
        message: "Profile updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update profile",
        { status: 500 },
      );
    }
  },
);
