import { NextRequest, NextResponse } from "next/server";
import { ExportService } from "@/lib/export-service";
import { getLogger } from "@/lib/logger";
import { readFile } from "fs/promises";

const logger = getLogger(["api", "export"]);

/**
 * Sanitize filename for Content-Disposition header
 * Removes/encodes special characters that could lead to header injection
 */
function sanitizeFilename(filename: string): string {
  // Remove any control characters, quotes, and newlines
  return filename.replace(/[^\w\s.-]/g, "_").substring(0, 255);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing authentication token" },
      { status: 401 },
    );
  }

  // Verify token and permissions
  const verification = await ExportService.verifyDownloadToken(fileId, token);

  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error || "Unauthorized" },
      { status: 403 },
    );
  }

  const { exportRecord } = verification;

  try {
    // Read file from disk
    const fileBuffer = await readFile(exportRecord.filePath);

    // Record download
    await ExportService.recordDownload(fileId);

    // Determine content type
    const contentType =
      exportRecord.fileType === "PDF_LOGBOOK"
        ? "application/pdf"
        : "application/octet-stream";

    // Sanitize filename for header
    const safeFileName = sanitizeFilename(exportRecord.fileName);

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": exportRecord.fileSize.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error) {
    logger.error("Error serving export file", { error, fileId });
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
