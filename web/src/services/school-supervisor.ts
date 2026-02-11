/**
 * School Supervisor Service
 * Business logic for school supervisors (Features 18-22)
 */

import { getLogger } from "@/lib/logger";
import {
  schoolSupervisorRepository,
  studentSupervisorAssignmentRepository,
} from "@/repositories";

const logger = getLogger(["services", "school-supervisor"]);

/**
 * Type definitions for repository return values with included relations
 */
type AssignmentWithRelations = {
  id: string;
  siwesSession?: { status: string } | null;
  siwesSessionId: string;
  student?: unknown;
  [key: string]: unknown;
};

export class SchoolSupervisorService {
  /**
   * Get school supervisor dashboard data (Feature 18)
   */
  async getDashboard(supervisorId: string) {
    logger.info("Getting school supervisor dashboard", { supervisorId });

    const supervisor =
      await schoolSupervisorRepository.findDashboardData(supervisorId);
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }

    // Get assigned students through assignments (includes relations)
    const assignments =
      await studentSupervisorAssignmentRepository.findManyBySupervisor(
        supervisorId,
      );

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
   * List assigned students for school supervisor (Feature 19)
   */
  async listAssignedStudents(supervisorId: string) {
    logger.info("Getting assigned students for school supervisor", {
      supervisorId,
    });

    const assignments =
      await studentSupervisorAssignmentRepository.findManyBySupervisor(
        supervisorId,
      );

    // Assignments include student, siwesSession relations
    return assignments.map((a) => ({
      student: a.student,
      enrollmentId: a.id,
      sessionId: a.siwesSessionId,
      session: a.siwesSession,
    }));
  }

  /**
   * Get school supervisor profile (Feature 21)
   */
  async getProfile(supervisorId: string) {
    logger.info("Getting school supervisor profile", { supervisorId });

    const supervisor = await schoolSupervisorRepository.prisma.findUnique({
      where: { id: supervisorId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }
    return supervisor;
  }

  /**
   * Update school supervisor profile (Feature 21)
   */
  async updateProfile(
    supervisorId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    logger.info("Updating school supervisor profile", { supervisorId, data });

    // School supervisors have: name, email (no phone/position in schema)
    return schoolSupervisorRepository.updateProfile(supervisorId, data);
  }
}

export const schoolSupervisorService = new SchoolSupervisorService();
