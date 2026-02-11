import { getLogger } from "@/lib/logger";
import {
  industrySupervisorRepository,
  schoolSupervisorRepository,
  studentSiwesDetailRepository,
  studentSupervisorAssignmentRepository,
  weeklyEntryRepository,
} from "@/repositories";

import { reviewService } from "./review";

const logger = getLogger(["services", "supervisor"]);

/**
 * Type definitions for repository return values with included relations
 * These document the expected shapes when repositories include relations
 */
type SiwesDetailWithRelations = {
  siwesSession?: { status: string } | null;
  student: unknown;
  [key: string]: unknown;
};

type AssignmentWithRelations = {
  id: string;
  siwesSession?: { status: string } | null;
  siwesSessionId: string;
  student?: unknown;
  [key: string]: unknown;
};

/**
 * Supervisor Service - Business logic for both industry and school supervisors
 */
export class SupervisorService {
  /**
   * Get industry supervisor dashboard data
   */
  async getIndustrySupervisorDashboard(supervisorId: string) {
    logger.info("Getting industry supervisor dashboard", { supervisorId });

    const supervisor =
      await industrySupervisorRepository.findDashboardData(supervisorId);
    if (!supervisor) {
      throw new Error("Industry supervisor not found");
    }

    // Get assigned students through SIWES details with session info
    const siwesDetails = await studentSiwesDetailRepository.prisma.findMany({
      where: {
        industrySupervisorId: supervisorId,
      },
      include: {
        siwesSession: true,
        student: true,
      },
    });

    // Filter for active sessions only
    const activeDetails = (siwesDetails as SiwesDetailWithRelations[]).filter(
      (detail) => detail.siwesSession?.status === "ACTIVE",
    );

    const assignedStudents = activeDetails.map((detail) => detail.student);

    // Get pending reviews
    const pendingReviews = await this.getPendingIndustryReviews(supervisorId);

    return {
      supervisor,
      assignedStudents,
      pendingReviews,
      stats: {
        totalStudents: assignedStudents.length,
        pendingReviews: pendingReviews.length,
      },
    };
  }

  /**
   * Get school supervisor dashboard data
   */
  async getSchoolSupervisorDashboard(supervisorId: string) {
    logger.info("Getting school supervisor dashboard", { supervisorId });

    const supervisor =
      await schoolSupervisorRepository.findDashboardData(supervisorId);
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }

    // Get assigned students through assignments (includes relations)
    const assignments =
      await studentSupervisorAssignmentRepository.prisma.findMany({
        where: { schoolSupervisorId: supervisorId },
        include: {
          student: true,
          siwesSession: true,
        },
      });

    // Filter active sessions - assignments include siwesSession relation
    const activeSessions = (assignments as AssignmentWithRelations[]).filter(
      (a) => a.siwesSession?.status === "ACTIVE",
    );

    return {
      supervisor,
      assignments: activeSessions,
      stats: {
        totalStudents: activeSessions.length,
        activeSessions: new Set(activeSessions.map((a) => a.siwesSessionId))
          .size,
      },
    };
  }

  /**
   * Get supervisor profile (industry or school)
   */
  async getSupervisorProfile(
    supervisorId: string,
    type: "INDUSTRY" | "SCHOOL",
  ) {
    logger.info("Getting supervisor profile", { supervisorId, type });

    if (type === "INDUSTRY") {
      const supervisor =
        await industrySupervisorRepository.findDashboardData(supervisorId);
      if (!supervisor) {
        throw new Error("Industry supervisor not found");
      }
      return supervisor;
    } else {
      const supervisor =
        await schoolSupervisorRepository.findDashboardData(supervisorId);
      if (!supervisor) {
        throw new Error("School supervisor not found");
      }
      return supervisor;
    }
  }

  /**
   * Update supervisor profile
   */
  async updateSupervisorProfile(
    supervisorId: string,
    type: "INDUSTRY" | "SCHOOL",
    data: {
      name?: string;
      email?: string;
      phone?: string;
      position?: string;
    },
  ) {
    logger.info("Updating supervisor profile", { supervisorId, type, data });

    if (type === "INDUSTRY") {
      // Industry supervisors have: name, email, phone, position
      const { position, phone, ...rest } = data;
      return industrySupervisorRepository.updateProfile(supervisorId, {
        ...rest,
        ...(position && { position }),
        ...(phone && { phone }),
      });
    } else {
      // School supervisors have: name, email (no phone/position in schema)
      const { name, email } = data;
      return schoolSupervisorRepository.updateProfile(supervisorId, {
        ...(name && { name }),
        ...(email && { email }),
      });
    }
  }

  /**
   * Get assigned students for a supervisor
   */
  async getAssignedStudents(supervisorId: string, type: "INDUSTRY" | "SCHOOL") {
    logger.info("Getting assigned students", { supervisorId, type });

    if (type === "INDUSTRY") {
      // Get students through SIWES details
      const siwesDetails = await studentSiwesDetailRepository.prisma.findMany({
        where: { industrySupervisorId: supervisorId },
        include: {
          student: true,
          siwesSession: true,
        },
      });
      return siwesDetails.map((detail) => detail.student);
    } else {
      const assignments =
        await studentSupervisorAssignmentRepository.prisma.findMany({
          where: { schoolSupervisorId: supervisorId },
          include: {
            student: true,
            siwesSession: true,
          },
        });
      // Assignments include student, siwesSession relations
      return (assignments as AssignmentWithRelations[]).map((a) => ({
        ...(a.student as object),
        enrollmentId: a.id,
        sessionId: a.siwesSessionId,
        session: a.siwesSession,
      }));
    }
  }

  /**
   * Get student week for review
   */
  async getStudentWeekForReview(
    studentId: string,
    weekId: string,
    supervisorId: string,
  ) {
    logger.info("Getting student week for review", {
      studentId,
      weekId,
      supervisorId,
    });

    const week = await weeklyEntryRepository.prisma.findUnique({
      where: { id: weekId },
      include: {
        student: true,
        siwesSession: true,
        diagrams: true,
        schoolSupervisorWeeklyComments: true,
        industrySupervisorWeeklyComments: true,
      },
    });
    if (!week) {
      throw new Error("Week not found");
    }

    // Verify week belongs to student
    if (week.studentId !== studentId) {
      throw new Error("Week does not belong to this student");
    }

    return week;
  }

  /**
   * Get pending industry reviews for supervisor
   */
  private async getPendingIndustryReviews(supervisorId: string) {
    logger.info("Getting pending industry reviews", { supervisorId });

    // Use reviewService to get pending review requests
    const pendingRequests =
      await reviewService.getPendingReviewRequests(supervisorId);

    // Map to expected format
    const pendingReviews = pendingRequests.map((request) => ({
      weekId: request.weeklyEntryId,
      studentId: request.studentId,
      weekNumber: request.weeklyEntry.weekNumber,
      startDate: request.requestedAt,
      endDate: request.requestedAt, // Using requestedAt as placeholder
    }));

    return pendingReviews;
  }
}

export const supervisorService = new SupervisorService();
