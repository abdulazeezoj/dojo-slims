import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getLogger } from "./logger";

const logger = getLogger(["lib", "file-upload"]);

interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  directory?: string;
}

interface UploadResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  size?: number;
  mimeType?: string;
  error?: string;
}

/**
 * File upload utility for handling diagram uploads
 */
export class FileUploader {
  private readonly uploadDir: string;
  private readonly defaultMaxSize = 10 * 1024 * 1024; // 10MB
  private readonly defaultAllowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  constructor(uploadDir = "uploads/diagrams") {
    this.uploadDir = uploadDir;
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir(): Promise<void> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
      logger.info("Created upload directory", { path: this.uploadDir });
    }
  }

  /**
   * Validate file
   */
  private validateFile(
    file: File,
    options: UploadOptions,
  ): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.defaultMaxSize;
    const allowedTypes = options.allowedTypes || this.defaultAllowedTypes;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const extension = originalName.split(".").pop();
    const uuid = uuidv4();
    return `${uuid}.${extension}`;
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Ensure upload directory exists
      await this.ensureUploadDir();

      // Generate filename and path
      const fileName = this.generateFileName(file.name);
      const directory = options.directory || "";
      const fullDir = directory
        ? join(this.uploadDir, directory)
        : this.uploadDir;

      // Create subdirectory if specified
      if (directory && !existsSync(fullDir)) {
        await mkdir(fullDir, { recursive: true });
      }

      const filePath = join(fullDir, fileName);

      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Generate relative file path (not publicly accessible)
      const fileUrl = filePath.replace(/\\/g, "/"); // Normalize path separators

      logger.info("File uploaded successfully", {
        fileName,
        size: file.size,
        mimeType: file.type,
      });

      return {
        success: true,
        fileName,
        filePath,
        fileUrl,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      logger.error("File upload failed", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { unlink } = await import("fs/promises");
      const fullPath = filePath.startsWith("uploads")
        ? filePath
        : join("uploads", filePath);

      if (existsSync(fullPath)) {
        await unlink(fullPath);
        logger.info("File deleted successfully", { path: fullPath });
        return true;
      }

      logger.warn("File not found for deletion", { path: fullPath });
      return false;
    } catch (error) {
      logger.error("File deletion failed", { error, path: filePath });
      return false;
    }
  }
}

// Export singleton instance
export const fileUploader = new FileUploader();
