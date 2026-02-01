import { requireAdmin } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { organizationService } from "@/services";
import { updateOrganizationSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireAdmin(
  async (request: NextRequest, session, context: { params: { orgId: string } }) => {
    try {
      const { orgId } = context.params;
      const organization = await organizationService.getOrganizationById(orgId);
      if (!organization) {
        return createErrorResponse("Organization not found", { status: 404 });
      }
      return createSuccessResponse(organization);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to load organization",
        { status: 500 },
      );
    }
  },
);

export const PATCH = requireAdmin(
  async (request: NextRequest, session, context: { params: { orgId: string } }) => {
    try {
      const { orgId } = context.params;
      const validation = await validateRequest(request, { body: updateOrganizationSchema });
      if (!validation.success) return validation.error;

      const { body } = validation.data;
      const updated = await organizationService.updateOrganization(orgId, body);

      return createSuccessResponse(updated, {
        message: "Organization updated successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update organization",
        { status: 500 },
      );
    }
  },
);

export const DELETE = requireAdmin(
  async (request: NextRequest, session, context: { params: { orgId: string } }) => {
    try {
      const { orgId } = context.params;
      await organizationService.deleteOrganization(orgId);

      return createSuccessResponse(null, {
        message: "Organization deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete organization",
        { status: 500 },
      );
    }
  },
);
