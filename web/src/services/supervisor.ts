import { getLogger } from "@/lib/logger";
import {
  assignmentRepository,
  industrySupervisorRepository,
  schoolSupervisorRepository,
  weeklyEntryRepository,
} from "@/repositories";

const logger = getLogger(["services", "supervisor"]);

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
      await industrySupervisorRepository.findById(supervisorId);
    if (!supervisor) {
      throw new Error("Industry supervisor not found");
    }

    // Get assigned students through SIWES details
    const assignedStudents =
      await industrySupervisorRepository.getAssignedStudents(supervisorId);

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

    const supervisor = await schoolSupervisorRepository.findById(supervisorId);
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }

    // Get assigned students through assignments (includes relations)
    const assignments =
      await assignmentRepository.findBySupervisor(supervisorId);

    // Filter active sessions - assignments include siwesSession relation
    const activeSessions = (
      assignments as Array<{
        siwesSession?: { status: string } | null;
        siwesSessionId: string;
      }>
    ).filter((a) => a.siwesSession?.status === "ACTIVE");

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
        await industrySupervisorRepository.findById(supervisorId);
      if (!supervisor) {
        throw new Error("Industry supervisor not found");
      }
      return supervisor;
    } else {
      const supervisor =
        await schoolSupervisorRepository.findById(supervisorId);
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
      return industrySupervisorRepository.update(supervisorId, {
        ...rest,
        ...(position && { position }),
        ...(phone && { phone }),
      });
    } else {
      // School supervisors have: name, email (no phone/position in schema)
      const { name, email } = data;
      return schoolSupervisorRepository.update(supervisorId, {
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
      return industrySupervisorRepository.getAssignedStudents(supervisorId);
    } else {
      const assignments =
        await assignmentRepository.findBySupervisor(supervisorId);
      // Assignments include student, siwesSession relations
      return (
        assignments as Array<{
          id: string;
          student: unknown;
          siwesSessionId: string;
          siwesSession: unknown;
        }>
      ).map((a) => ({
        ...a.student,
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

    const week = await weeklyEntryRepository.findById(weekId);
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
    // Get all assigned students
    const students =
      await industrySupervisorRepository.getAssignedStudents(supervisorId);

    const pendingReviews: Array<{
      weekId: string;
      studentId: string;
      weekNumber: number;
      startDate: Date;
      endDate: Date;
    }> = [];

    for (const student of students) {
      // Get weeks with pending review requests but no industry comment
      const weeks = await weeklyEntryRepository.findMany({
        where: {
          studentId: student.id,
          reviewRequest: {
            industrySupervisorId: supervisorId,
            status: "PENDING",
          },
          weeklyComments: {
            none: {
              commenterType: "INDUSTRY_SUPERVISOR",
            },
          },
        },
      });

      pendingReviews.push(...weeks);
    }

    return pendingReviews;
  }
}

export const supervisorService = new SupervisorService();
