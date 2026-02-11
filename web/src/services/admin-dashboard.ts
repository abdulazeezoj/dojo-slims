import { getLogger } from "@/lib/logger";
import {
  placementOrganizationRepository,
  schoolSupervisorRepository,
  siwesSessionRepository,
  studentRepository,
  studentSessionEnrollmentRepository,
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
    const activeSessions = await siwesSessionRepository.findAllActive();

    // Get total students
    const totalStudents = await studentRepository.prisma.count();

    // Get total school supervisors
    const totalSupervisors = await schoolSupervisorRepository.prisma.count();

    // Get total placement organizations
    const totalOrganizations =
      await placementOrganizationRepository.prisma.count();

    // Get active enrollments (students in active sessions)
    // First get active session IDs, then count enrollments
    const activeSessionIds = activeSessions.map((s) => s.id);
    const activeEnrollments =
      await studentSessionEnrollmentRepository.prisma.count({
        where: {
          siwesSessionId: {
            in: activeSessionIds,
          },
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
   * Get active sessions with enrollment counts
   */
  async getActiveSessions() {
    logger.info("Getting active sessions");

    const sessions = await siwesSessionRepository.findAllActive();

    // Get all enrollments for active sessions in one query
    const sessionIds = sessions.map((s) => s.id);
    const allEnrollments =
      await studentSessionEnrollmentRepository.prisma.findMany({
        where: {
          siwesSessionId: {
            in: sessionIds,
          },
        },
      });

    // Group enrollments by session ID
    const enrollmentCounts = new Map<string, number>();
    for (const enrollment of allEnrollments) {
      const count = enrollmentCounts.get(enrollment.siwesSessionId) || 0;
      enrollmentCounts.set(enrollment.siwesSessionId, count + 1);
    }

    // Map sessions with counts
    const sessionsWithCounts = sessions.map((session) => ({
      ...session,
      studentCount: enrollmentCounts.get(session.id) || 0,
    }));

    return sessionsWithCounts;
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    logger.info("Getting system metrics");

    const activeSessions = await siwesSessionRepository.findAllActive();

    const metrics = await Promise.all(
      activeSessions.map(async (session) => {
        // Get all enrollments for this session
        const enrollments =
          await studentSessionEnrollmentRepository.prisma.findMany({
            where: {
              siwesSessionId: session.id,
            },
          });

        const totalEnrolled = enrollments.length;

        // Count students with SIWES details for this session
        const withSiwesDetails =
          await studentSessionEnrollmentRepository.prisma.count({
            where: {
              siwesSessionId: session.id,
              student: {
                studentSiwesDetails: {
                  some: {
                    siwesSessionId: session.id,
                  },
                },
              },
            },
          });

        // Count students with supervisor assignments for this session
        const withSupervisor =
          await studentSessionEnrollmentRepository.prisma.count({
            where: {
              siwesSessionId: session.id,
              student: {
                studentSupervisorAssignments: {
                  some: {
                    siwesSessionId: session.id,
                  },
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
