import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/middlewares/auth";
import { createOrganizationSchema } from "@/schemas";
import { organizationService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");
    const searchTerm = searchParams.get("search") || undefined;

    const result = await organizationService.getAllOrganizations({
      skip,
      take,
      searchTerm,
    });
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load organizations",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const validation = await validateRequest(request, {
      body: createOrganizationSchema,
    });
    if (!validation.success) {return validation.error;}

    const { body } = validation.data;
    const organization = await organizationService.createOrganization(body);

    return createSuccessResponse(organization, {
      message: "Organization created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create organization",
      { status: 500 },
    );
  }
});
