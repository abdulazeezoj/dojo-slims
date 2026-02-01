import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { fileUploader } from "@/lib/file-upload";
import { requireStudent } from "@/middlewares/auth";
import { logbookService } from "@/services";
import { NextRequest } from "next/server";

/**
 * POST /api/student/logbook/weeks/[weekId]/diagram
 * Upload diagram for a week (multipart/form-data)
 *
 * Form fields:
 * - file: Image file
 * - caption (optional): Diagram caption
 */
export const POST = requireStudent(
  async (
    request: NextRequest,
    session,
    { params }: { params: { weekId: string } },
  ) => {
    try {
      const { weekId } = params;

      // Verify ownership
      const week = await logbookService.getWeekDetails(weekId);
      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== session.user.userReferenceId) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      // Parse form data
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const caption = formData.get("caption") as string | null;

      if (!file) {
        return createErrorResponse("No file provided", { status: 400 });
      }

      // Upload file
      const uploadResult = await fileUploader.uploadFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        directory: `${week.studentId}/${weekId}`,
      });

      if (!uploadResult.success) {
        return createErrorResponse(uploadResult.error || "Upload failed", {
          status: 400,
        });
      }

      // Save diagram to database
      const diagram = await logbookService.uploadWeeklyDiagram(
        weekId,
        uploadResult.fileUrl!,
        caption || undefined,
      );

      return createSuccessResponse(diagram, {
        message: "Diagram uploaded successfully",
        status: 201,
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to upload diagram",
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/student/logbook/weeks/[weekId]/diagram
 * Delete diagram for a week
 *
 * Query params:
 * - diagramId: ID of diagram to delete
 */
export const DELETE = requireStudent(
  async (
    request: NextRequest,
    session,
    { params }: { params: { weekId: string } },
  ) => {
    try {
      const { weekId } = params;
      const { searchParams } = new URL(request.url);
      const diagramId = searchParams.get("diagramId");

      if (!diagramId) {
        return createErrorResponse("Diagram ID is required", { status: 400 });
      }

      // Verify ownership
      const week = await logbookService.getWeekDetails(weekId);
      if (!week) {
        return createErrorResponse("Week not found", { status: 404 });
      }

      if (week.studentId !== session.user.userReferenceId) {
        return createErrorResponse("Unauthorized", { status: 403 });
      }

      // Get diagram details before deletion to delete file
      const diagram = week.diagrams?.find((d) => d.id === diagramId);
      if (diagram && diagram.imageUrl) {
        // Delete physical file
        await fileUploader.deleteFile(diagram.imageUrl);
      }

      // Delete from database
      await logbookService.deleteWeeklyDiagram(diagramId);

      return createSuccessResponse(null, {
        message: "Diagram deleted successfully",
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to delete diagram",
        { status: 500 },
      );
    }
  },
);
