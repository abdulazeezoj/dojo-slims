import { NextRequest, NextResponse } from "next/server";
import { ExportService } from "@/lib/export-service";
import { readFile } from "fs/promises";

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

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${exportRecord.fileName}"`,
        "Content-Length": exportRecord.fileSize.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error) {
    console.error("Error serving export file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
