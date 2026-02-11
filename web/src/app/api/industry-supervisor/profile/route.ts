import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireIndustrySupervisor } from "@/lib/auth-server";
import { updateIndustrySupervisorProfileSchema } from "@/schemas";
import { supervisorService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireIndustrySupervisor(
  async (request: NextRequest, session) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const profile =
        await supervisorService.getIndustrySupervisorProfile(supervisorId);

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

export const PATCH = requireIndustrySupervisor(
  async (request: NextRequest, session) => {
    try {
      const supervisorId = session.user.userReferenceId;
      const validation = await validateRequest(request, {
        body: updateIndustrySupervisorProfileSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body } = validation.data;
      const updated = await supervisorService.updateIndustrySupervisorProfile(
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
