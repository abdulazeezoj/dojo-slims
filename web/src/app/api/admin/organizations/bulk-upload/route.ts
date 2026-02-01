import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/middlewares/auth";
import { organizationService } from "@/services";

import type { NextRequest } from "next/server";

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const body = await request.json();

    if (!Array.isArray(body.organizations)) {
      return createErrorResponse(
        "Invalid request: organizations array required",
        { status: 400 },
      );
    }

    const result = await organizationService.bulkCreateOrganizations(
      body.organizations,
    );

    return createSuccessResponse(result, {
      message: `Bulk upload completed: ${result.successful} successful, ${result.failed} failed`,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error
        ? error.message
        : "Failed to bulk upload organizations",
      { status: 500 },
    );
  }
});
