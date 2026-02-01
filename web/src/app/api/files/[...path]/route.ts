import { createErrorResponse } from "@/lib/api-response";
import { config } from "@/lib/config";
import { fileUploader } from "@/lib/file-upload";
import { getLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/middlewares/auth";
import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const logger = getLogger(["api", "files"]);

/**
 * GET /api/files/[...path]
 * Secure file serving endpoint with ownership verification
 *
 * Security features:
 * - Authentication required
 * - Ownership verification
 * - Path traversal prevention
 * - Security headers
 * - Access logging
 */
export const GET = requireAuth<{ params: { path: string[] } }>(
  async (
    request: NextRequest,
    session,
    context: { params: { path: string[] } },
  ) => {
    try {
      const { params } = context;
      const filePath = params.path.join("/");

      logger.info("File access attempt", {
        userId: session.user.id,
        filePath,
      });

      // 1. Verify file ownership based on path structure
      // Path format: {userId}/{weekId}/{filename}
      const pathParts = filePath.split("/");

      if (pathParts.length < 2) {
        return createErrorResponse("Invalid file path", { status: 400 });
      }

      const fileUserId = pathParts[0];

      // 2. Check if user owns this file or has permission
      const hasPermission = await verifyFileAccess(
        session.user.id,
        session.user.role,
        fileUserId,
        filePath,
      );

      if (!hasPermission) {
        logger.warn("Unauthorized file access attempt", {
          userId: session.user.id,
          filePath,
        });
        return createErrorResponse(
          "You don't have permission to access this file",
          {
            status: 403,
          },
        );
      }

      // 3. Get file stats for verification
      const stats = await fileUploader.getFileStats(filePath);

      if (!stats || !stats.exists) {
        return createErrorResponse("File not found", { status: 404 });
      }

      // 4. Read file
      const fullPath = join(config.BASE_UPLOAD_PATH, filePath);
      const fileBuffer = await readFile(fullPath);

      // 5. Determine content type (default to octet-stream for security)
      const contentType = getContentType(filePath);

      // 6. Serve with security headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": stats.size.toString(),
          "Content-Disposition": "inline", // or 'attachment' to force download
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, max-age=3600",
          "X-Frame-Options": "DENY",
        },
      });
    } catch (error) {
      logger.error("File serving failed", { error, path: context.params.path });
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to serve file",
        { status: 500 },
      );
    }
  },
);

/**
 * Verify if user has access to the file
 */
async function verifyFileAccess(
  userId: string,
  userRole: string,
  fileUserId: string,
  _filePath: string,
): Promise<boolean> {
  // Admins can access all files
  if (userRole === "ADMIN") {
    return true;
  }

  // Get the user's reference ID (student/supervisor ID)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userReferenceId: true, role: true },
  });

  if (!user) {
    return false;
  }

  // Users can access their own files
  if (fileUserId === user.userReferenceId) {
    return true;
  }

  // Supervisors can access their students' files
  if (userRole === "SCHOOL_SUPERVISOR" || userRole === "INDUSTRY_SUPERVISOR") {
    const hasStudentAccess = await checkSupervisorStudentAccess(
      user.userReferenceId!,
      fileUserId,
      userRole,
    );

    if (hasStudentAccess) {
      return true;
    }
  }

  return false;
}

/**
 * Check if supervisor has access to student's files
 */
async function checkSupervisorStudentAccess(
  supervisorId: string,
  studentId: string,
  role: string,
): Promise<boolean> {
  try {
    if (role === "SCHOOL_SUPERVISOR") {
      const assignment = await prisma.studentSupervisorAssignment.findFirst({
        where: {
          studentId,
          schoolSupervisorId: supervisorId,
        },
      });
      return !!assignment;
    }

    if (role === "INDUSTRY_SUPERVISOR") {
      const siwesDetail = await prisma.studentSiwesDetail.findFirst({
        where: {
          studentId,
          industrySupervisorId: supervisorId,
        },
      });
      return !!siwesDetail;
    }

    return false;
  } catch (error) {
    logger.error("Error checking supervisor access", { error });
    return false;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop();

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}
