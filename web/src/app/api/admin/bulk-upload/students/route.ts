
import { apiResponse } from "@/lib/api-response";
import { getLogger } from "@/lib/logger";
import { bulkUploadService } from "@/services";

import type { NextRequest } from "next/server";

const logger = getLogger(["api", "admin", "bulk-upload", "students"]);

/**
 * POST /api/admin/bulk-upload/students
 * Upload Excel file to bulk create students
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return apiResponse.error("No file provided", 400);
    }

    // Validate file type
    if (
      !file.type.includes("spreadsheet") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      return apiResponse.error(
        "Invalid file type. Please upload an Excel file (.xlsx or .xls)",
        400,
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return apiResponse.error(
        "File size exceeds maximum allowed size of 5MB",
        400,
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
      return apiResponse.error(
        "Bulk upload failed. No students were created.",
        400,
        { result },
      );
    }

    logger.info("Student bulk upload completed", {
      total: result.totalRows,
      success: result.successCount,
      failed: result.failedCount,
    });

    return apiResponse.success(
      {
        message: `Bulk upload completed. ${result.successCount} students created successfully.`,
        ...result,
      },
      result.failedCount > 0 ? 207 : 200, // 207 Multi-Status if there are partial failures
    );
  } catch (error) {
    logger.error("Student bulk upload failed", { error });
    return apiResponse.error(
      error instanceof Error ? error.message : "Bulk upload failed",
      500,
    );
  }
}
