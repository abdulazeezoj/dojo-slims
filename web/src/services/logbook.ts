import type { WeeklyEntry } from "@/generated/prisma/client";
import { getLogger } from "@/lib/logger";
import {
  diagramRepository,
  studentSiwesDetailRepository,
  weeklyEntryRepository,
} from "@/repositories";

import { reviewService } from "./review";

const logger = getLogger(["services", "logbook"]);

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/**
 * Validate and sanitize logbook entry content
 */
function validateEntryContent(content: string): string {
  // Check for empty content
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new Error("Entry content cannot be empty");
  }

  // Check length (max 5000 characters for a daily entry)
  const maxLength = 5000;
  if (trimmed.length > maxLength) {
    throw new Error(
      `Entry content too long: Maximum ${maxLength} characters allowed`,
    );
  }

  // XSS prevention: Remove script tags and on* event handlers
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^\s>]*/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  ];

  let sanitized = trimmed;
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Check if content was modified (potential XSS attempt)
  if (sanitized !== trimmed) {
    throw new Error(
      "Invalid content: Scripts and event handlers are not allowed",
    );
  }

  return sanitized;
}

/**
 * Logbook Service - Business logic for weekly entry management
 */
export class LogbookService {
  /**
   * Get all logbook weeks for a student in a session
   */
  async getLogbookWeeks(studentId: string, sessionId: string) {
    logger.info("Getting logbook weeks", { studentId, sessionId });

    const weeks = await weeklyEntryRepository.findManyByStudentSession(
      studentId,
      sessionId,
    );

    // Repository includes diagrams and weeklyComments, but TypeScript doesn't know that
    const weeksWithRelations = weeks as Array<
      (typeof weeks)[0] & {
        diagrams: Array<{ id: string; filePath: string; uploadedAt: Date }>;
        weeklyComments: Array<{ id: string; comment: string; createdAt: Date }>;
      }
    >;

    return weeksWithRelations.map((week) => ({
      ...week,
      hasEntries:
        !!week.mondayEntry ||
        !!week.tuesdayEntry ||
        !!week.wednesdayEntry ||
        !!week.thursdayEntry ||
        !!week.fridayEntry ||
        !!week.saturdayEntry,
      hasDiagram: week.diagrams.length > 0,
      commentCount: week.weeklyComments.length,
      isLocked: week.isLocked,
    }));
  }

  /**
   * Get details of a specific week
   */
  async getWeekDetails(weekId: string) {
    logger.info("Getting week details", { weekId });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    return week;
  }

  /**
   * Create or update a week entry for a specific day
   */
  async upsertWeekEntry(
    weekId: string,
    studentId: string,
    dayOfWeek: DayOfWeek,
    content: string,
  ): Promise<WeeklyEntry> {
    logger.info("Upserting week entry", { weekId, studentId, dayOfWeek });

    // Check if week exists and student owns it
    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    // Verify student owns this week
    if (week.studentId !== studentId) {
      throw new Error("Unauthorized: Week does not belong to this student");
    }

    if (week.isLocked) {
      throw new Error(
        "Cannot edit locked week. Contact your school supervisor to unlock.",
      );
    }

    // Validate and sanitize content
    const sanitizedContent = validateEntryContent(content);

    // Map day of week to the correct field
    const dayFieldMap: Record<DayOfWeek, string> = {
      monday: "mondayEntry",
      tuesday: "tuesdayEntry",
      wednesday: "wednesdayEntry",
      thursday: "thursdayEntry",
      friday: "fridayEntry",
      saturday: "saturdayEntry",
    };

    const fieldName = dayFieldMap[dayOfWeek];

    return weeklyEntryRepository.prisma.update({
      where: { id: weekId },
      data: {
        [fieldName]: sanitizedContent,
      },
    });
  }

  /**
   * Delete entry for a specific day
   */
  async deleteWeekEntry(
    weekId: string,
    studentId: string,
    dayOfWeek: DayOfWeek,
  ): Promise<WeeklyEntry> {
    logger.info("Deleting week entry", { weekId, studentId, dayOfWeek });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    // Verify student owns this week
    if (week.studentId !== studentId) {
      throw new Error("Unauthorized: Week does not belong to this student");
    }

    if (week.isLocked) {
      throw new Error(
        "Cannot edit locked week. Contact your school supervisor to unlock.",
      );
    }

    // Map day of week to the correct field
    const dayFieldMap: Record<DayOfWeek, string> = {
      monday: "mondayEntry",
      tuesday: "tuesdayEntry",
      wednesday: "wednesdayEntry",
      thursday: "thursdayEntry",
      friday: "fridayEntry",
      saturday: "saturdayEntry",
    };

    const fieldName = dayFieldMap[dayOfWeek];

    return weeklyEntryRepository.prisma.update({
      where: { id: weekId },
      data: {
        [fieldName]: null,
      },
    });
  }

  /**
   * Upload weekly diagram
   */
  async uploadWeeklyDiagram(
    weekId: string,
    filePath: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    caption?: string,
  ) {
    logger.info("Uploading weekly diagram", { weekId, fileName });

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
   * Delete weekly diagram
   */
  async deleteWeeklyDiagram(diagramId: string) {
    logger.info("Deleting weekly diagram", { diagramId });

    const diagram = await diagramRepository.prisma.findUnique({
      where: { id: diagramId },
    });
    if (!diagram) {
      throw new Error("Diagram not found");
    }

    // Check if week is locked
    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: diagram.weeklyEntryId },
    });
    if (week?.isLocked) {
      throw new Error(
        "Cannot delete diagram from locked week. Contact your school supervisor to unlock.",
      );
    }

    return diagramRepository.deleteDiagram(diagramId);
  }

  /**
   * Request review from industry supervisor
   */
  async requestWeekReview(weekId: string, studentId: string) {
    logger.info("Requesting week review", { weekId, studentId });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    if (week.isLocked) {
      throw new Error("Week is already locked and reviewed");
    }

    // Verify student owns this week
    if (week.studentId !== studentId) {
      throw new Error("Unauthorized: Week does not belong to this student");
    }

    // Check if there are entries
    const hasEntries =
      !!week.mondayEntry ||
      !!week.tuesdayEntry ||
      !!week.wednesdayEntry ||
      !!week.thursdayEntry ||
      !!week.fridayEntry ||
      !!week.saturdayEntry;

    if (!hasEntries) {
      throw new Error(
        "Cannot request review for week with no entries. Please add at least one day's entry.",
      );
    }

    // Get student's SIWES details to find industry supervisor
    const siwesDetails = await studentSiwesDetailRepository.prisma.findUnique({
      where: {
        studentId_siwesSessionId: {
          studentId,
          siwesSessionId: week.siwesSessionId,
        },
      },
    });

    if (!siwesDetails) {
      throw new Error(
        "SIWES details not found. Please complete your SIWES details first.",
      );
    }

    // Create review request through review service
    const reviewRequest = await reviewService.createReviewRequest(
      weekId,
      studentId,
      siwesDetails.industrySupervisorId,
    );

    logger.info("Review request created successfully", {
      reviewRequestId: reviewRequest.id,
      weekId,
    });

    return {
      success: true,
      weekId,
      reviewRequestId: reviewRequest.id,
      message: "Review request sent successfully",
    };
  }

  /**
   * Check if week is locked
   */
  async isWeekLocked(weekId: string): Promise<boolean> {
    logger.info("Checking if week is locked", { weekId });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    return week.isLocked;
  }

  /**
   * Get all diagrams for a week
   */
  async getWeekDiagrams(weekId: string) {
    logger.info("Getting week diagrams", { weekId });

    return diagramRepository.findByWeeklyEntry(weekId);
  }
}

export const logbookService = new LogbookService();
