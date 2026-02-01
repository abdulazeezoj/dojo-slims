import { requireStudent } from "@/middlewares/auth";
import { validateRequest } from "@/lib/api-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { siwesDetailService } from "@/services";
import { siwesDetailSchema } from "@/schemas";
import { NextRequest } from "next/server";

export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    const studentId = session.user.userReferenceId;
    const details = await siwesDetailService.getSiwesDetails(studentId);

    return createSuccessResponse(details || null);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load SIWES details",
      { status: 500 },
    );
  }
});

export const POST = requireStudent(async (request: NextRequest, session) => {
  try {
    const studentId = session.user.userReferenceId;
    const validation = await validateRequest(request, {
      body: siwesDetailSchema,
    });

    if (!validation.success) {
      return validation.error;
    }

    const { body } = validation.data;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    const details = await siwesDetailService.createOrUpdateSiwesDetails(
      studentId,
      sessionId,
      {
        placementOrganizationId: body.placementOrganizationId!,
        trainingStartDate: body.trainingStartDate,
        trainingEndDate: body.trainingEndDate,
        jobTitle: body.jobTitle,
        departmentAtOrg: body.departmentAtOrg,
        industrySupervisor: {
          name: body.industrySupervisorName,
          email: body.industrySupervisorEmail,
          phone: body.industrySupervisorPhone,
          position: body.industrySupervisorPosition,
        },
      },
    );

    return createSuccessResponse(details, {
      message: "SIWES details saved successfully",
      status: 201,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to save SIWES details",
      { status: 500 },
    );
  }
});

export const PATCH = POST; // Same logic for update
