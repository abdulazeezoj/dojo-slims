/**
 * Diagram Service
 * Business logic for weekly diagram upload and management (Feature 7)
 */

import { getLogger } from "@/lib/logger";
import { diagramRepository, weeklyEntryRepository } from "@/repositories";

const logger = getLogger(["services", "diagram"]);

export class DiagramService {
  /**
   * Upload diagram to a weekly entry
   */
  async uploadDiagram(
    weekId: string,
    filePath: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    caption?: string,
  ) {
    logger.info("Uploading diagram", { weekId, fileName });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    if (week.isLocked) {
      throw new Error(
        "Cannot upload diagram to locked week. Contact your school supervisor to unlock.",
      );
    }

    // Validate file size (max 5MB per diagram)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      throw new Error(
        `File too large: Maximum diagram size is ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type (only allow images and PDFs)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      throw new Error(
        `Invalid file type: Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed`,
      );
    }

    // Validate file path to prevent path traversal attacks
    if (filePath.includes("..") || filePath.includes("~")) {
      throw new Error("Invalid file path: Path traversal detected");
    }

    // Create diagram record
    return diagramRepository.createDiagram({
      weeklyEntry: {
        connect: { id: weekId },
      },
      filePath,
      fileName,
      fileSize,
      mimeType,
      uploadedAt: new Date(),
      caption,
    });
  }

  /**
   * Delete diagram
   */
  async deleteDiagram(diagramId: string) {
    logger.info("Deleting diagram", { diagramId });

    const diagram = await diagramRepository.findByIdWithEntry(diagramId);
    if (!diagram) {
      throw new Error("Diagram not found");
    }

    // Check if week is locked
    const week = diagram.weeklyEntry;
    if (week?.isLocked) {
      throw new Error(
        "Cannot delete diagram from locked week. Contact your school supervisor to unlock.",
      );
    }

    return diagramRepository.deleteDiagram(diagramId);
  }

  /**
   * Get diagram by ID
   */
  async getDiagram(diagramId: string) {
    logger.info("Getting diagram", { diagramId });

    const diagram = await diagramRepository.findByIdWithEntry(diagramId);
    if (!diagram) {
      throw new Error("Diagram not found");
    }

    return diagram;
  }

  /**
   * Get all diagrams for a week
   */
  async getWeekDiagrams(weekId: string) {
    logger.info("Getting diagrams for week", { weekId });

    return diagramRepository.findByWeeklyEntry(weekId);
  }
}

export const diagramService = new DiagramService();
