import { requireIndustrySupervisor } from "@/middlewares/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { supervisorService } from "@/services";
import { NextRequest } from "next/server";

export const GET = requireIndustrySupervisor(async (request: NextRequest, session) => {
  try {
    const supervisorId = session.user.userReferenceId;
    const students = await supervisorService.getAssignedStudents(supervisorId, "INDUSTRY_SUPERVISOR");

    return createSuccessResponse(students, {
      message: "Students loaded successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load students",
      { status: 500 },
    );
  }
});
