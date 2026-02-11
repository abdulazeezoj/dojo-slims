import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth-server";
import { getLogger } from "@/lib/logger";
import { bulkUploadService } from "@/services";

const logger = getLogger([
  "api",
  "admin",
  "bulk-upload",
  "students",
  "template",
]);

/**
 * GET /api/admin/bulk-upload/students/template
 * Download Excel template for student bulk upload
 */
export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    logger.info("Generating student bulk upload template");

    const template = bulkUploadService.generateStudentTemplate();

    return new NextResponse(new Uint8Array(template), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=student-bulk-upload-template.xlsx",
      },
    });
  } catch (error) {
    logger.error("Failed to generate student template", { error });
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 },
    );
  }
});
