import { fileTypeFromBuffer } from "file-type";
import { existsSync } from "fs";
import { mkdir, stat, writeFile } from "fs/promises";
import { join, normalize, resolve } from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config";
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
 * File upload utility for handling diagram uploads with enhanced security
 */
export class FileUploader {
  private readonly uploadDir: string;
  private readonly allowedMimeTypes: Set<string>;
  private readonly blacklistedMimeTypes: Set<string>;
  private readonly allowedExtensions: Set<string>;
  private readonly maxFileSize: number;

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || config.BASE_UPLOAD_PATH;
    this.maxFileSize = config.MAX_FILE_SIZE;

    // Parse allowed MIME types from config
    this.allowedMimeTypes = new Set(
      config.ALLOWED_MIME_TYPES.split(",").map((t) => t.trim().toLowerCase()),
    );

    // Parse blacklisted MIME types from config
    this.blacklistedMimeTypes = new Set(
      config.BLACKLISTED_MIME_TYPES.split(",").map((t) =>
        t.trim().toLowerCase(),
      ),
    );

    // Parse allowed extensions from config
    this.allowedExtensions = new Set(
      config.ALLOWED_FILE_EXTENSIONS.split(",").map((e) =>
        e.trim().toLowerCase(),
      ),
    );
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
   * Validate file extension (from user input)
   */
  private validateExtension(fileName: string): {
    valid: boolean;
    extension?: string;
    error?: string;
  } {
    const parts = fileName.toLowerCase().split(".");

    if (parts.length < 2) {
      return { valid: false, error: "File has no extension" };
    }

    const extension = parts.pop()!;

    // Check against allowed extensions
    if (!this.allowedExtensions.has(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed. Allowed: ${Array.from(this.allowedExtensions).join(", ")}`,
      };
    }

    return { valid: true, extension };
  }

  /**
   * Validate file content using magic numbers (real file type detection)
   */
  private async validateFileContent(
    buffer: Buffer,
  ): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
    if (!config.UPLOAD_ENABLE_MAGIC_NUMBER_CHECK) {
      return { valid: true };
    }

    try {
      const fileType = await fileTypeFromBuffer(buffer);

      if (!fileType) {
        return {
          valid: false,
          error: "Could not determine file type",
        };
      }

      // Check against blacklist first (security priority)
      if (this.blacklistedMimeTypes.has(fileType.mime.toLowerCase())) {
        logger.warn("Blocked blacklisted file type", { mime: fileType.mime });
        return {
          valid: false,
          error: "This file type is not allowed for security reasons",
        };
      }

      // Check if detected type matches allowed types
      if (!this.allowedMimeTypes.has(fileType.mime.toLowerCase())) {
        return {
          valid: false,
          detectedType: fileType.mime,
          error: `File content type ${fileType.mime} does not match allowed types`,
        };
      }

      return { valid: true, detectedType: fileType.mime };
    } catch (error) {
      logger.error("File content validation failed", { error });
      return {
        valid: false,
        error: "Failed to validate file content",
      };
    }
  }

  /**
   * Sanitize and process image files
   */
  private async processImage(buffer: Buffer): Promise<Buffer> {
    if (!config.UPLOAD_ENABLE_IMAGE_PROCESSING) {
      return buffer;
    }

    try {
      // Process with Sharp: resize, strip metadata, re-encode
      return await sharp(buffer)
        .resize(config.UPLOAD_MAX_IMAGE_WIDTH, config.UPLOAD_MAX_IMAGE_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: config.UPLOAD_IMAGE_QUALITY,
          mozjpeg: true, // Better compression
        })
        .toBuffer();
    } catch (error) {
      logger.error("Image processing failed", { error });
      throw new Error("Failed to process image. File may be corrupted.");
    }
  }

  /**
   * Validate file
   */
  private validateFile(
    file: File,
    options: UploadOptions,
  ): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.maxFileSize;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
      };
    }

    // Basic MIME type check (can be spoofed, but good first layer)
    const mimeType = file.type.toLowerCase();

    // Check blacklist first
    if (this.blacklistedMimeTypes.has(mimeType)) {
      return {
        valid: false,
        error: "This file type is not allowed for security reasons",
      };
    }

    // Check allowlist
    if (!this.allowedMimeTypes.has(mimeType)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${Array.from(this.allowedMimeTypes).join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename with sanitized extension
   */
  private generateFileName(originalName: string): string {
    const extensionValidation = this.validateExtension(originalName);

    if (!extensionValidation.valid) {
      throw new Error(extensionValidation.error);
    }

    const uuid = uuidv4();
    return `${uuid}.${extensionValidation.extension}`;
  }

  /**
   * Prevent path traversal attacks
   */
  private sanitizePath(basePath: string, userPath: string): string {
    const normalizedBase = resolve(basePath);
    const normalizedUser = resolve(
      basePath,
      normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, ""),
    );

    if (!normalizedUser.startsWith(normalizedBase)) {
      throw new Error("Invalid path: Path traversal detected");
    }

    return normalizedUser;
  }

  /**
   * Check user quota (placeholder - implement based on your needs)
   */
  async checkUserQuota(
    _userId: string,
  ): Promise<{ allowed: boolean; error?: string }> {
    // TODO: Implement quota checking logic
    // For now, always allow
    return { allowed: true };
  }

  /**
   * Upload single file with enhanced security
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      // 1. Validate file metadata
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // 2. Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 3. Validate file content (magic numbers)
      const contentValidation = await this.validateFileContent(buffer);
      if (!contentValidation.valid) {
        logger.warn("File content validation failed", {
          fileName: file.name,
          error: contentValidation.error,
        });
        return {
          success: false,
          error: contentValidation.error,
        };
      }

      // 4. Process/sanitize image if enabled
      let processedBuffer = buffer;
      const isImage = contentValidation.detectedType?.startsWith("image/");

      if (isImage && config.UPLOAD_ENABLE_IMAGE_PROCESSING) {
        processedBuffer = Buffer.from(await this.processImage(buffer));
        logger.info("Image processed and sanitized", {
          originalSize: buffer.length,
          processedSize: processedBuffer.length,
        });
      }

      // 5. Ensure upload directory exists
      await this.ensureUploadDir();

      // 6. Generate secure filename and path
      const fileName = this.generateFileName(file.name);
      const directory = options.directory || "";

      // Sanitize directory path to prevent traversal
      const fullDir = directory
        ? this.sanitizePath(this.uploadDir, directory)
        : this.uploadDir;

      // Create subdirectory if specified
      if (directory && !existsSync(fullDir)) {
        await mkdir(fullDir, { recursive: true });
      }

      const filePath = join(fullDir, fileName);

      // 7. Save file
      await writeFile(filePath, processedBuffer);

      // 8. Generate relative URL for database storage
      const relativePath = filePath
        .replace(this.uploadDir, "")
        .replace(/^[\/\\]/, "");
      const fileUrl = relativePath.replace(/\\/g, "/");

      logger.info("File uploaded successfully", {
        fileName,
        size: processedBuffer.length,
        mimeType: contentValidation.detectedType || file.type,
        processed: isImage && config.UPLOAD_ENABLE_IMAGE_PROCESSING,
      });

      return {
        success: true,
        fileName,
        filePath: relativePath,
        fileUrl,
        size: processedBuffer.length,
        mimeType: contentValidation.detectedType || file.type,
      };
    } catch (error) {
      logger.error("File upload failed", { error, fileName: file.name });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Delete file with path traversal protection
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { unlink } = await import("fs/promises");

      // Sanitize path to prevent traversal
      const safePath = this.sanitizePath(this.uploadDir, filePath);

      if (existsSync(safePath)) {
        await unlink(safePath);
        logger.info("File deleted successfully", { path: safePath });
        return true;
      }

      logger.warn("File not found for deletion", { path: safePath });
      return false;
    } catch (error) {
      logger.error("File deletion failed", { error, path: filePath });
      return false;
    }
  }

  /**
   * Get file stats (for quota checking, verification, etc.)
   */
  async getFileStats(
    filePath: string,
  ): Promise<{ size: number; exists: boolean } | null> {
    try {
      const safePath = this.sanitizePath(this.uploadDir, filePath);

      if (!existsSync(safePath)) {
        return { size: 0, exists: false };
      }

      const stats = await stat(safePath);
      return { size: stats.size, exists: true };
    } catch (error) {
      logger.error("Failed to get file stats", { error, path: filePath });
      return null;
    }
  }
}

// Export singleton instance
export const fileUploader = new FileUploader();
