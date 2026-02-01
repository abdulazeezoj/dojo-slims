import { NextResponse, type NextRequest } from "next/server";

import { getLogger } from "@/lib/logger";
import { requireAdmin } from "@/middlewares/auth";
import { bulkUploadService } from "@/services";

const logger = getLogger([
  "api",
  "admin",
  "bulk-upload",
  "school-supervisors",
  "template",
]);

/**
 * GET /api/admin/bulk-upload/school-supervisors/template
 * Download Excel template for school supervisor bulk upload
 */
export const GET = requireAdmin(async (_request: NextRequest, _session) => {
  try {
    logger.info("Generating school supervisor bulk upload template");

    const template = bulkUploadService.generateSupervisorTemplate();

    return new NextResponse(new Uint8Array(template), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=school-supervisor-bulk-upload-template.xlsx",
      },
    });
  } catch (error) {
    logger.error("Failed to generate supervisor template", { error });
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 },
    );
  }
});
