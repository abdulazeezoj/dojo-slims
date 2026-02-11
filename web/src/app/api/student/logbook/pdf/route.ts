import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireStudent } from "@/lib/auth-server";
import { studentRepository } from "@/repositories";
import { pdfGeneratorService } from "@/services";

import type { NextRequest } from "next/server";

/**
 * GET /api/student/logbook/pdf
 * Generate ITF-compliant PDF logbook for student's session
 *
 * Query Parameters:
 * - sessionId: The SIWES session ID to generate PDF for
 * - validate: Optional - if "true", only validates completeness without generating PDF
 */
export const GET = requireStudent(async (request: NextRequest, session) => {
  try {
    // Get student record from user ID (Better Auth User ID -> Student ID)
    const student = await studentRepository.findByUserId(session.user.id);
    if (!student) {
      return createErrorResponse("Student profile not found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const validateOnly = searchParams.get("validate") === "true";

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    // If validation only, check logbook completeness
    if (validateOnly) {
      const validation = await pdfGeneratorService.validateLogbookCompleteness(
        student.id,
        sessionId,
      );

      return createSuccessResponse({
        validation,
        message: validation.isComplete
          ? "Logbook is complete and ready for PDF generation"
          : "Logbook has incomplete sections",
      });
    }

    // Generate PDF
    const pdfBuffer = await pdfGeneratorService.generateLogbookPdf(
      student.id,
      sessionId,
    );

    // Return PDF as downloadable file (cast Buffer for TypeScript)
    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="logbook-${student.id}-${sessionId}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }) as any;
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to generate PDF",
      { status: 500 },
    );
  }
});

/**
 * POST /api/student/logbook/pdf
 * Generate PDF with custom options
 *
 * Body:
 * - sessionId: The SIWES session ID
 * - options: PDF generation options (optional)
 *   - includeCoverPage: boolean
 *   - includeSignatures: boolean
 *   - watermark: string
 */
export const POST = requireStudent(async (request: NextRequest, session) => {
  try {
    // Get student record from user ID (Better Auth User ID -> Student ID)
    const student = await studentRepository.findByUserId(session.user.id);
    if (!student) {
      return createErrorResponse("Student profile not found", { status: 404 });
    }

    const body = await request.json();
    const { sessionId, options } = body;

    if (!sessionId) {
      return createErrorResponse("Session ID is required", { status: 400 });
    }

    // Validate logbook completeness before generation
    const validation = await pdfGeneratorService.validateLogbookCompleteness(
      student.id,
      sessionId,
    );

    if (!validation.isComplete) {
      return createErrorResponse(
        "Logbook is incomplete. Please complete all required sections before generating PDF.",
        {
          status: 400,
          details: {
            missingWeeks: validation.missingWeeks,
            warnings: validation.warnings,
          },
        },
      );
    }

    // Generate custom PDF
    const pdfBuffer = await pdfGeneratorService.generateCustomLogbookPdf(
      student.id,
      sessionId,
      options || {},
    );

    // Return PDF as downloadable file (cast Buffer for TypeScript)
    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="logbook-${student.id}-${sessionId}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }) as any;
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to generate PDF",
      { status: 500 },
    );
  }
});
