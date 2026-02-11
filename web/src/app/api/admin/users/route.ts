import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { createAdminSchema, paginationSchema } from "@/schemas";
import { adminUserService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);

    const validation = await validateRequest(request, {
      query: paginationSchema.optional(),
    });

    if (!validation.success) {
      return validation.error;
    }

    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");
    const searchTerm = searchParams.get("search") || undefined;

    const result = await adminUserService.getAllAdmins({
      skip,
      take,
      searchTerm,
    });

    return createSuccessResponse(result, {
      message: "Admins loaded successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load admins",
      { status: 500 },
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const validation = await validateRequest(request, {
      body: createAdminSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const admin = await adminUserService.createAdmin(body);

    return createSuccessResponse(admin, {
      message: "Admin created successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create admin",
      { status: 500 },
    );
  }
});
