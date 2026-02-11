import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import {
  bulkEnrollStudentsSchema,
  bulkEnrollSupervisorsSchema,
  enrollStudentSchema,
  enrollSupervisorSchema,
} from "@/schemas";
import { enrollmentService } from "@/services";

import type { NextRequest } from "next/server";

export const GET = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    const enrollments =
      await enrollmentService.getSessionEnrollments(sessionId);
    return createSuccessResponse(enrollments);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to load enrollments",
      { status: 500 },
    );
  }
});

/**
 * POST /api/admin/enrollments
 * Create new enrollment (student or supervisor, single or bulk)
 * Supports multiple enrollment types based on request body structure
 */
export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const body = await request.json();

    // Determine enrollment type based on request body structure
    // Priority: bulk operations > single operations

    // Check for bulk student enrollment
    if (body.studentIds && Array.isArray(body.studentIds)) {
      const validation = await validateRequest(request, {
        body: bulkEnrollStudentsSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body: validatedBody } = validation.data;
      if (!validatedBody) {
        return createErrorResponse("Invalid request body", { status: 400 });
      }

      const { studentIds, siwesSessionId: sessionId } = validatedBody;
      const result = await enrollmentService.bulkEnrollStudents(
        sessionId,
        studentIds,
      );

      const hasErrors = result.errors.length > 0;
      return createSuccessResponse(
        {
          message: `Bulk enrollment completed. ${result.success.length} student(s) enrolled successfully.`,
          ...result,
        },
        { status: hasErrors ? 207 : 201 }, // 207 Multi-Status if partial success
      );
    }

    // Check for bulk supervisor enrollment
    if (body.supervisorIds && Array.isArray(body.supervisorIds)) {
      const validation = await validateRequest(request, {
        body: bulkEnrollSupervisorsSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body: validatedBody } = validation.data;
      if (!validatedBody) {
        return createErrorResponse("Invalid request body", { status: 400 });
      }

      const { supervisorIds, siwesSessionId: sessionId } = validatedBody;
      const result = await enrollmentService.bulkEnrollSupervisors(
        sessionId,
        supervisorIds,
      );

      const hasErrors = result.errors.length > 0;
      return createSuccessResponse(
        {
          message: `Bulk enrollment completed. ${result.success.length} supervisor(s) enrolled successfully.`,
          ...result,
        },
        { status: hasErrors ? 207 : 201 }, // 207 Multi-Status if partial success
      );
    }

    // Check for single student enrollment
    if (body.studentId) {
      const validation = await validateRequest(request, {
        body: enrollStudentSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body: validatedBody } = validation.data;
      if (!validatedBody) {
        return createErrorResponse("Invalid request body", { status: 400 });
      }

      const { studentId, siwesSessionId } = validatedBody;
      const enrollment = await enrollmentService.addStudentToSession(
        studentId,
        siwesSessionId,
      );

      return createSuccessResponse(
        {
          message: "Student enrolled successfully",
          enrollment,
        },
        { status: 201 },
      );
    }

    // Check for single supervisor enrollment
    if (body.schoolSupervisorId) {
      const validation = await validateRequest(request, {
        body: enrollSupervisorSchema,
      });

      if (!validation.success) {
        return validation.error;
      }

      const { body: validatedBody } = validation.data;
      if (!validatedBody) {
        return createErrorResponse("Invalid request body", { status: 400 });
      }

      const { schoolSupervisorId, siwesSessionId } = validatedBody;
      const enrollment = await enrollmentService.addSupervisorToSession(
        schoolSupervisorId,
        siwesSessionId,
      );

      return createSuccessResponse(
        {
          message: "Supervisor enrolled successfully",
          enrollment,
        },
        { status: 201 },
      );
    }

    // If none of the above patterns match
    return createErrorResponse(
      "Invalid request body. Must provide either: studentId, schoolSupervisorId, studentIds[], or supervisorIds[]",
      { status: 400 },
    );
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to create enrollment",
      { status: 500 },
    );
  }
});
