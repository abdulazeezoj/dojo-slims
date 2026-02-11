import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-server";
import { getLogger } from "@/lib/logger";
import { bulkUploadService } from "@/services";

import type { NextRequest } from "next/server";

const logger = getLogger(["api", "admin", "bulk-upload", "students"]);

/**
 * POST /api/admin/bulk-upload/students
 * Upload Excel file to bulk create students
 */
export const POST = requireAdmin(async (request: NextRequest, _session) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return createErrorResponse("No file provided", { status: 400 });
    }

    // Validate file type
    if (
      !file.type.includes("spreadsheet") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      return createErrorResponse(
        "Invalid file type. Please upload an Excel file (.xlsx or .xls)",
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return createErrorResponse(
        "File size exceeds maximum allowed size of 5MB",
        { status: 400 },
      );
    }

    logger.info("Processing student bulk upload", {
      fileName: file.name,
      fileSize: file.size,
    });

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process bulk upload
    const result = await bulkUploadService.uploadStudents(buffer);

    if (!result.success) {
      return createErrorResponse(
        "Bulk upload failed. No students were created.",
        { status: 400, details: result },
      );
    }

    logger.info("Student bulk upload completed", {
      total: result.totalRows,
      success: result.successCount,
      failed: result.failedCount,
    });

    return createSuccessResponse(
      {
        message: `Bulk upload completed. ${result.successCount} students created successfully.`,
        ...result,
      },
      { status: result.failedCount > 0 ? 207 : 200 }, // 207 Multi-Status if there are partial failures
    );
  } catch (error) {
    logger.error("Student bulk upload failed", { error });
    return createErrorResponse(
      error instanceof Error ? error.message : "Bulk upload failed",
      { status: 500 },
    );
  }
});
