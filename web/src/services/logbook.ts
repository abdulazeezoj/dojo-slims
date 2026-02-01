import type { WeeklyEntry } from "@/generated/prisma/client";
import { getLogger } from "@/lib/logger";
import { diagramRepository, weeklyEntryRepository } from "@/repositories";

const logger = getLogger(["services", "logbook"]);

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/**
 * Logbook Service - Business logic for weekly entry management
 */
export class LogbookService {
  /**
   * Get all logbook weeks for a student in a session
   */
  async getLogbookWeeks(studentId: string, sessionId: string) {
    logger.info("Getting logbook weeks", { studentId, sessionId });

    const weeks = await weeklyEntryRepository.findByStudentSession(
      studentId,
      sessionId,
    );

    // Repository includes diagrams and weeklyComments, but TypeScript doesn't know that
    const weeksWithRelations = weeks as Array<
      (typeof weeks)[0] & {
        diagrams: any[];
        weeklyComments: any[];
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

    const week = await weeklyEntryRepository.findById(weekId);
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
    dayOfWeek: DayOfWeek,
    content: string,
  ): Promise<WeeklyEntry> {
    logger.info("Upserting week entry", { weekId, dayOfWeek });

    // Check if week is locked
    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
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

    return weeklyEntryRepository.update(weekId, {
      [fieldName]: content,
    });
  }

  /**
   * Delete entry for a specific day
   */
  async deleteWeekEntry(
    weekId: string,
    dayOfWeek: DayOfWeek,
  ): Promise<WeeklyEntry> {
    logger.info("Deleting week entry", { weekId, dayOfWeek });

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
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

    return weeklyEntryRepository.update(weekId, {
      [fieldName]: null,
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

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
    }

    if (week.isLocked) {
      throw new Error(
        "Cannot upload diagram to locked week. Contact your school supervisor to unlock.",
      );
    }

    // Create diagram record
    return diagramRepository.create({
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

    const diagram = await diagramRepository.findById(diagramId);
    if (!diagram) {
      throw new Error("Diagram not found");
    }

    // Check if week is locked
    const week = await weeklyEntryRepository.findById(diagram.weeklyEntryId);
    if (week?.isLocked) {
      throw new Error(
        "Cannot delete diagram from locked week. Contact your school supervisor to unlock.",
      );
    }

    return diagramRepository.delete(diagramId);
  }

  /**
   * Request review from industry supervisor
   */
  async requestWeekReview(weekId: string, studentId: string) {
    logger.info("Requesting week review", { weekId, studentId });

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
    }

    if (week.isLocked) {
      throw new Error("Week is already locked and reviewed");
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

    // Repository includes reviewRequest, but TypeScript doesn't know that
    const weekWithReview = week as typeof week & {
      reviewRequest: any | null;
    };

    // Check if review already requested
    if (weekWithReview.reviewRequest) {
      throw new Error("Review already requested for this week");
    }

    // Create review request (this will trigger email notification in the background)
    // Review request creation will be handled by review service
    return { success: true, weekId, message: "Review request sent" };
  }

  /**
   * Check if week is locked
   */
  async isWeekLocked(weekId: string): Promise<boolean> {
    logger.info("Checking if week is locked", { weekId });

    const week = await weeklyEntryRepository.findById(weekId);
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
