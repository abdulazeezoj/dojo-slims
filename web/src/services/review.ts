import { getLogger } from "@/lib/logger";
import {
  industrySupervisorFinalCommentRepository,
  industrySupervisorReviewRequestRepository,
  industrySupervisorWeeklyCommentRepository,
  schoolSupervisorFinalCommentRepository,
  schoolSupervisorWeeklyCommentRepository,
  studentSiwesDetailRepository,
  studentSupervisorAssignmentRepository,
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

    const [schoolComments, industryComments] = await Promise.all([
      schoolSupervisorWeeklyCommentRepository.findByWeeklyEntry(weekId),
      industrySupervisorWeeklyCommentRepository.findByWeeklyEntry(weekId),
    ]);

    // Combine and sort by created date
    const allComments = [
      ...schoolComments.map((c) => ({
        ...c,
        commenterType: "SCHOOL_SUPERVISOR" as const,
      })),
      ...industryComments.map((c) => ({
        ...c,
        commenterType: "INDUSTRY_SUPERVISOR" as const,
      })),
    ];

    return allComments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  /**
   * Create a review request for a weekly entry
   */
  async createReviewRequest(
    weekId: string,
    studentId: string,
    industrySupervisorId: string,
  ) {
    logger.info("Creating review request", {
      weekId,
      studentId,
      industrySupervisorId,
    });

    // Check if week exists
    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    // Check if review request already exists for this week
    const existingRequest =
      await industrySupervisorReviewRequestRepository.findByWeeklyEntry(weekId);
    if (existingRequest) {
      throw new Error("Review request already exists for this week");
    }

    // Create review request
    const reviewRequest =
      await industrySupervisorReviewRequestRepository.create({
        weeklyEntry: {
          connect: { id: weekId },
        },
        student: {
          connect: { id: studentId },
        },
        industrySupervisor: {
          connect: { id: industrySupervisorId },
        },
        status: "PENDING",
        requestedAt: new Date(),
      });

    logger.info("Review request created", {
      id: reviewRequest.id,
      weekId,
    });

    return reviewRequest;
  }

  /**
   * Get pending review requests for an industry supervisor
   */
  async getPendingReviewRequests(industrySupervisorId: string) {
    logger.info("Getting pending review requests", { industrySupervisorId });

    return industrySupervisorReviewRequestRepository.findPendingByIndustrySupervisor(
      industrySupervisorId,
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

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    // Verify industry supervisor is assigned to this student
    const siwesDetails =
      await studentSiwesDetailRepository.findByStudentAndSession(
        week.studentId,
        week.siwesSessionId,
      );

    if (!siwesDetails || siwesDetails.industrySupervisorId !== supervisorId) {
      throw new Error(
        "Unauthorized: Industry supervisor not assigned to this student",
      );
    }

    // Create comment
    const comment =
      await industrySupervisorWeeklyCommentRepository.prisma.create({
        data: {
          weeklyEntry: {
            connect: { id: weekId },
          },
          industrySupervisor: {
            connect: { id: supervisorId },
          },
          comment: commentText,
          commentedAt: new Date(),
        },
      });

    // Mark review request as reviewed (if exists)
    const reviewRequest =
      await industrySupervisorReviewRequestRepository.findByWeeklyEntry(weekId);
    if (reviewRequest && reviewRequest.status === "PENDING") {
      await industrySupervisorReviewRequestRepository.markAsReviewed(
        reviewRequest.id,
      );
    }

    // Auto-lock week only if BOTH supervisors have commented
    const hasSchoolComment = await this.hasSchoolComment(weekId);
    if (hasSchoolComment) {
      await this.lockWeek(weekId, supervisorId, "INDUSTRY_SUPERVISOR");
      logger.info("Week auto-locked after both supervisors commented", {
        weekId,
      });
    }

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

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    // Verify school supervisor is assigned to this student
    const assignment =
      await studentSupervisorAssignmentRepository.findByStudentAndSession(
        week.studentId,
        week.siwesSessionId,
      );

    if (!assignment || assignment.schoolSupervisorId !== supervisorId) {
      throw new Error(
        "Unauthorized: School supervisor not assigned to this student",
      );
    }

    // Create comment
    const comment = await schoolSupervisorWeeklyCommentRepository.prisma.create(
      {
        data: {
          weeklyEntry: {
            connect: { id: weekId },
          },
          schoolSupervisor: {
            connect: { id: supervisorId },
          },
          comment: commentText,
          commentedAt: new Date(),
        },
      },
    );

    // Auto-lock week only if BOTH supervisors have commented
    const hasIndustryComment = await this.hasIndustryComment(weekId);
    if (hasIndustryComment) {
      await this.lockWeek(weekId, supervisorId, "SCHOOL_SUPERVISOR");
      logger.info("Week auto-locked after both supervisors commented", {
        weekId,
      });
    }

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

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    if (week.isLocked) {
      logger.warn("Week already locked", { weekId });
      return week;
    }

    return weeklyEntryRepository.prisma.update({
      where: { id: weekId },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy:
          supervisorType === "INDUSTRY_SUPERVISOR"
            ? "INDUSTRY_SUPERVISOR"
            : "SCHOOL_SUPERVISOR",
      },
    });
  }

  /**
   * Unlock a week (only school supervisors can do this)
   */
  async unlockWeek(weekId: string, supervisorId: string) {
    logger.info("Unlocking week", { weekId, supervisorId });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    if (!week.isLocked) {
      throw new Error("Week is not locked");
    }

    // Verify school supervisor is assigned to this student
    const assignment =
      await studentSupervisorAssignmentRepository.findByStudentAndSession(
        week.studentId,
        week.siwesSessionId,
      );

    if (!assignment || assignment.schoolSupervisorId !== supervisorId) {
      throw new Error(
        "Unauthorized: Only assigned school supervisors can unlock weeks",
      );
    }

    return weeklyEntryRepository.prisma.update({
      where: { id: weekId },
      data: {
        isLocked: false,
        lockedAt: null,
        lockedBy: null,
      },
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

    if (supervisorType === "INDUSTRY_SUPERVISOR") {
      // Check if final comment already exists
      const existing =
        await industrySupervisorFinalCommentRepository.findByStudentAndSession(
          studentId,
          sessionId,
        );

      if (existing) {
        throw new Error("Final industry supervisor comment already submitted");
      }

      // Create final comment
      return industrySupervisorFinalCommentRepository.prisma.create({
        data: {
          student: {
            connect: { id: studentId },
          },
          siwesSession: {
            connect: { id: sessionId },
          },
          industrySupervisor: {
            connect: { id: supervisorId },
          },
          comment: commentText,
          rating: rating || null,
          commentedAt: new Date(),
        },
      });
    } else {
      // School supervisor
      const existing =
        await schoolSupervisorFinalCommentRepository.findByStudentAndSession(
          studentId,
          sessionId,
        );

      if (existing) {
        throw new Error("Final school supervisor comment already submitted");
      }

      return schoolSupervisorFinalCommentRepository.prisma.create({
        data: {
          student: {
            connect: { id: studentId },
          },
          siwesSession: {
            connect: { id: sessionId },
          },
          schoolSupervisor: {
            connect: { id: supervisorId },
          },
          comment: commentText,
          rating: rating || null,
          commentedAt: new Date(),
        },
      });
    }
  }

  /**
   * Get all final comments for a student in a session
   */
  async getFinalComments(studentId: string, sessionId: string) {
    logger.info("Getting final comments", { studentId, sessionId });

    const [schoolComment, industryComment] = await Promise.all([
      schoolSupervisorFinalCommentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      ),
      industrySupervisorFinalCommentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      ),
    ]);

    return {
      schoolSupervisor: schoolComment,
      industrySupervisor: industryComment,
    };
  }

  /**
   * Check if week has industry supervisor comment
   */
  async hasIndustryComment(weekId: string): Promise<boolean> {
    const comments =
      await industrySupervisorWeeklyCommentRepository.findByWeeklyEntry(weekId);
    return comments.length > 0;
  }

  /**
   * Check if week has school supervisor comment
   */
  async hasSchoolComment(weekId: string): Promise<boolean> {
    const comments =
      await schoolSupervisorWeeklyCommentRepository.findByWeeklyEntry(weekId);
    return comments.length > 0;
  }
}

export const reviewService = new ReviewService();
