import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import fs from "fs/promises";
import path from "path";

interface CreateExportOptions {
  userId: string;
  fileType: string;
  fileName: string;
  fileBuffer: Buffer;
  expiresInMinutes?: number;
  maxDownloads?: number;
}

interface DownloadTokenPayload {
  fileId: string;
  userId: string;
  exp: number;
}

export class ExportService {
  private static EXPORT_DIR = path.join(process.cwd(), "export");

  /**
   * Create a new export file with signed URL
   */
  static async createExport(options: CreateExportOptions) {
    const {
      userId,
      fileType,
      fileName,
      fileBuffer,
      expiresInMinutes = config.EXPORT_DEFAULT_EXPIRY_MINUTES,
      maxDownloads,
    } = options;

    // Generate unique filename to prevent collisions
    const fileId = crypto.randomUUID();
    const ext = path.extname(fileName);
    const safeFileName = `${fileId}${ext}`;
    const filePath = path.join(this.EXPORT_DIR, safeFileName);

    // Ensure export directory exists
    await fs.mkdir(this.EXPORT_DIR, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Create database record
    const exportRecord = await prisma.exportedFile.create({
      data: {
        id: fileId,
        userId,
        fileType,
        fileName,
        filePath,
        fileSize: fileBuffer.length,
        expiresAt,
        maxDownloads,
      },
    });

    // Generate signed token
    const token = this.generateDownloadToken(fileId, userId, expiresAt);

    // Generate download URL
    const downloadUrl = `/api/export/${fileId}?token=${token}`;

    return {
      fileId,
      downloadUrl,
      expiresAt,
      fileName,
    };
  }

  /**
   * Generate JWT token for download authentication
   */
  private static generateDownloadToken(
    fileId: string,
    userId: string,
    expiresAt: Date,
  ): string {
    if (!config.EXPORT_TOKEN_SECRET) {
      throw new Error(
        "EXPORT_TOKEN_SECRET is not configured. Please set it in your environment variables.",
      );
    }

    const payload: DownloadTokenPayload = {
      fileId,
      userId,
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    return jwt.sign(payload, config.EXPORT_TOKEN_SECRET, {
      algorithm: "HS256",
    });
  }

  /**
   * Verify download token and check permissions
   */
  static async verifyDownloadToken(
    fileId: string,
    token: string,
  ): Promise<{ valid: boolean; exportRecord?: any; error?: string }> {
    try {
      if (!config.EXPORT_TOKEN_SECRET) {
        return {
          valid: false,
          error: "Export token secret not configured",
        };
      }

      // Verify JWT signature and expiry
      const payload = jwt.verify(
        token,
        config.EXPORT_TOKEN_SECRET,
      ) as DownloadTokenPayload;

      // Check fileId matches
      if (payload.fileId !== fileId) {
        return { valid: false, error: "Invalid token for this file" };
      }

      // Fetch export record
      const exportRecord = await prisma.exportedFile.findUnique({
        where: { id: fileId },
        include: { user: true },
      });

      if (!exportRecord) {
        return { valid: false, error: "File not found" };
      }

      // Check if expired
      if (exportRecord.expiresAt < new Date()) {
        // Clean up expired file
        await this.deleteExportFile(fileId);
        return { valid: false, error: "File has expired" };
      }

      // Check download limit
      if (
        exportRecord.maxDownloads &&
        exportRecord.downloadCount >= exportRecord.maxDownloads
      ) {
        return { valid: false, error: "Download limit exceeded" };
      }

      // Check user matches
      if (exportRecord.userId !== payload.userId) {
        return { valid: false, error: "Unauthorized" };
      }

      return { valid: true, exportRecord };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: "Token has expired" };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: "Invalid token" };
      }
      return { valid: false, error: "Token verification failed" };
    }
  }

  /**
   * Increment download counter
   */
  static async recordDownload(fileId: string): Promise<void> {
    await prisma.exportedFile.update({
      where: { id: fileId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Delete export file from disk and database
   */
  static async deleteExportFile(fileId: string): Promise<void> {
    const exportRecord = await prisma.exportedFile.findUnique({
      where: { id: fileId },
    });

    if (!exportRecord) return;

    // Delete from disk
    try {
      await fs.unlink(exportRecord.filePath);
    } catch (error) {
      console.error(`Failed to delete file ${exportRecord.filePath}:`, error);
    }

    // Delete from database
    await prisma.exportedFile.delete({
      where: { id: fileId },
    });
  }

  /**
   * Cleanup expired files (run as cron job)
   */
  static async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await prisma.exportedFile.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        await this.deleteExportFile(file.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to cleanup file ${file.id}:`, error);
      }
    }

    return deletedCount;
  }
}
