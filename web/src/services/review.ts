import type { CommenterType } from "@/generated/prisma/client";
import { getLogger } from "@/lib/logger";
import {
  finalCommentRepository,
  weeklyCommentRepository,
  weeklyEntryRepository,
} from "@/repositories";

const logger = getLogger(["services", "review"]);

/**
 * Review Service - Business logic for comments and week locking
 */
export class ReviewService {
  /**
   * Get all comments for a specific week
   */
  async getWeekComments(weekId: string) {
    logger.info("Getting week comments", { weekId });

    const comments = await weeklyCommentRepository.findByWeek(weekId);

    return comments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  /**
   * Add industry supervisor comment to a week
   */
  async addIndustryComment(
    weekId: string,
    supervisorId: string,
    commentText: string,
  ) {
    logger.info("Adding industry comment", { weekId, supervisorId });

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
    }

    // Create comment
    const comment = await weeklyCommentRepository.create({
      weeklyEntry: {
        connect: { id: weekId },
      },
      commenterId: supervisorId,
      commenterType: "INDUSTRY_SUPERVISOR" as CommenterType,
      comment: commentText,
      commentedAt: new Date(),
    });

    // Auto-lock week after industry supervisor comments
    await this.lockWeek(weekId, supervisorId, "INDUSTRY_SUPERVISOR");

    return comment;
  }

  /**
   * Add school supervisor comment to a week
   */
  async addSchoolComment(
    weekId: string,
    supervisorId: string,
    commentText: string,
  ) {
    logger.info("Adding school comment", { weekId, supervisorId });

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
    }

    // Create comment
    const comment = await weeklyCommentRepository.create({
      weeklyEntry: {
        connect: { id: weekId },
      },
      commenterId: supervisorId,
      commenterType: "SCHOOL_SUPERVISOR" as CommenterType,
      comment: commentText,
      commentedAt: new Date(),
    });

    // Auto-lock week after school supervisor comments
    await this.lockWeek(weekId, supervisorId, "SCHOOL_SUPERVISOR");

    return comment;
  }

  /**
   * Lock a week (prevents further editing)
   */
  async lockWeek(
    weekId: string,
    supervisorId: string,
    supervisorType: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR",
  ) {
    logger.info("Locking week", { weekId, supervisorId, supervisorType });

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
    }

    if (week.isLocked) {
      logger.warn("Week already locked", { weekId });
      return week;
    }

    return weeklyEntryRepository.update(weekId, {
      isLocked: true,
      lockedAt: new Date(),
      lockedBy: supervisorType,
    });
  }

  /**
   * Unlock a week (only school supervisors can do this)
   */
  async unlockWeek(weekId: string, supervisorId: string) {
    logger.info("Unlocking week", { weekId, supervisorId });

    const week = await weeklyEntryRepository.findById(weekId);
    if (!week) {
      throw new Error("Week not found");
    }

    if (!week.isLocked) {
      throw new Error("Week is not locked");
    }

    return weeklyEntryRepository.update(weekId, {
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
    });
  }

  /**
   * Add final comment (industry or school supervisor)
   */
  async addFinalComment(
    studentId: string,
    sessionId: string,
    supervisorId: string,
    commentText: string,
    supervisorType: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR",
    rating?: string,
  ) {
    logger.info("Adding final comment", {
      studentId,
      sessionId,
      supervisorId,
      supervisorType,
    });

    // Check if final comment already exists
    const existing = await finalCommentRepository.findByStudentSessionAndType(
      studentId,
      sessionId,
      supervisorType,
    );

    if (existing) {
      throw new Error(
        `Final ${supervisorType.toLowerCase().replace("_", " ")} comment already submitted`,
      );
    }

    // Create final comment
    return finalCommentRepository.create({
      student: {
        connect: { id: studentId },
      },
      siwesSession: {
        connect: { id: sessionId },
      },
      commenterId: supervisorId,
      commenterType: supervisorType,
      comment: commentText,
      rating: rating || null,
      commentedAt: new Date(),
    });
  }

  /**
   * Get all final comments for a student in a session
   */
  async getFinalComments(studentId: string, sessionId: string) {
    logger.info("Getting final comments", { studentId, sessionId });

    return finalCommentRepository.findByStudentSession(studentId, sessionId);
  }

  /**
   * Check if week has industry supervisor comment
   */
  async hasIndustryComment(weekId: string): Promise<boolean> {
    const comments = await weeklyCommentRepository.findByWeek(weekId);
    return comments.some((c) => c.commenterType === "INDUSTRY_SUPERVISOR");
  }

  /**
   * Check if week has school supervisor comment
   */
  async hasSchoolComment(weekId: string): Promise<boolean> {
    const comments = await weeklyCommentRepository.findByWeek(weekId);
    return comments.some((c) => c.commenterType === "SCHOOL_SUPERVISOR");
  }
}

export const reviewService = new ReviewService();
