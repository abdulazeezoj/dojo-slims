import { getLogger } from "@/lib/logger";
import {
  activityLogRepository,
  placementRepository,
  schoolSupervisorRepository,
  sessionRepository,
  studentEnrollmentRepository,
  studentRepository,
} from "@/repositories";

const logger = getLogger(["services", "admin-dashboard"]);

/**
 * Admin Dashboard Service - Business logic for admin dashboard statistics
 */
export class AdminDashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    logger.info("Getting dashboard stats");

    // Get active sessions count
    const activeSessions = await sessionRepository.findActive();

    // Get total students
    const totalStudents = await studentRepository.count();

    // Get total school supervisors
    const totalSupervisors = await schoolSupervisorRepository.count();

    // Get total placement organizations
    const totalOrganizations = await placementRepository.count();

    // Get active enrollments (students in active sessions)
    const activeEnrollments = await studentEnrollmentRepository.count({
      siwesSession: {
        status: "ACTIVE",
      },
    });

    return {
      activeSessions: activeSessions.length,
      totalStudents,
      totalSupervisors,
      totalOrganizations,
      activeEnrollments,
    };
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 20) {
    logger.info("Getting recent activities", { limit });

    const activities = await activityLogRepository.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return activities;
  }

  /**
   * Get active sessions with enrollment counts
   */
  async getActiveSessions() {
    logger.info("Getting active sessions");

    const sessions = await sessionRepository.findActive();

    // Get enrollment counts for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const studentCount = await studentEnrollmentRepository.count({
          siwesSessionId: session.id,
        });

        return {
          ...session,
          studentCount,
        };
      }),
    );

    return sessionsWithCounts;
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    logger.info("Getting system metrics");

    const activeSessions = await sessionRepository.findActive();

    const metrics = await Promise.all(
      activeSessions.map(async (session) => {
        // Get all enrollments for this session
        const enrollments = await studentEnrollmentRepository.findMany({
          where: {
            siwesSessionId: session.id,
          },
        });

        const totalEnrolled = enrollments.length;

        // Count students with SIWES details for this session
        const withSiwesDetails = await studentEnrollmentRepository.count({
          siwesSessionId: session.id,
          student: {
            studentSiwesDetails: {
              some: {
                siwesSessionId: session.id,
              },
            },
          },
        });

        // Count students with supervisor assignments for this session
        const withSupervisor = await studentEnrollmentRepository.count({
          siwesSessionId: session.id,
          student: {
            studentSupervisorAssignments: {
              some: {
                siwesSessionId: session.id,
              },
            },
          },
        });

        return {
          sessionId: session.id,
          sessionName: session.name,
          totalEnrolled,
          withSiwesDetails,
          withSupervisor,
          detailsCompletionRate:
            totalEnrolled > 0
              ? Math.round((withSiwesDetails / totalEnrolled) * 100)
              : 0,
          supervisorAssignmentRate:
            totalEnrolled > 0
              ? Math.round((withSupervisor / totalEnrolled) * 100)
              : 0,
        };
      }),
    );

    return metrics;
  }
}

export const adminDashboardService = new AdminDashboardService();
