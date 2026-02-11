import { getLogger } from "@/lib/logger";
import {
  placementOrganizationRepository,
  schoolSupervisorRepository,
  siwesSessionRepository,
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSupervisorAssignmentRepository,
  industrySupervisorWeeklyCommentRepository,
  schoolSupervisorWeeklyCommentRepository,
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

  /**
   * Get recent activities in the system
   * Returns a summary of recent actions from different entities
   */
  async getRecentActivities(limit = 20) {
    logger.info(`Getting recent activities (limit: ${limit})`);

    // Since we don't have an activity_logs table yet, we'll generate activities
    // from various recent database records as a workaround
    const activities: Array<{
      id: string;
      userType: string;
      action: string;
      entityType: string;
      entityId: string;
      details: string;
      createdAt: Date;
    }> = [];

    try {
      // Fetch all activity sources in parallel for better performance
      const [
        recentEnrollments,
        recentAssignments,
        recentIndustryComments,
        recentSchoolComments,
      ] = await Promise.all([
        // Get recent student enrollments
        studentSessionEnrollmentRepository.prisma.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { enrolledAt: "desc" },
          include: {
            student: { select: { name: true, matricNumber: true } },
            siwesSession: { select: { name: true } },
          },
        }),
        // Get recent supervisor assignments
        studentSupervisorAssignmentRepository.prisma.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { assignedAt: "desc" },
          include: {
            student: { select: { name: true, matricNumber: true } },
            schoolSupervisor: { select: { name: true, staffId: true } },
            siwesSession: { select: { name: true } },
          },
        }),
        // Get recent industry supervisor comments
        industrySupervisorWeeklyCommentRepository.prisma.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { commentedAt: "desc" },
          include: {
            industrySupervisor: { select: { name: true } },
            weeklyEntry: {
              select: {
                weekNumber: true,
                student: { select: { name: true, matricNumber: true } },
              },
            },
          },
        }),
        // Get recent school supervisor comments
        schoolSupervisorWeeklyCommentRepository.prisma.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { commentedAt: "desc" },
          include: {
            schoolSupervisor: { select: { name: true } },
            weeklyEntry: {
              select: {
                weekNumber: true,
                student: { select: { name: true, matricNumber: true } },
              },
            },
          },
        }),
      ]);

      // Process enrollments
      for (const enrollment of recentEnrollments) {
        activities.push({
          id: enrollment.id,
          userType: "STUDENT",
          action: "ENROLLED",
          entityType: "StudentSessionEnrollment",
          entityId: enrollment.id,
          details: `${enrollment.student.name} (${enrollment.student.matricNumber}) enrolled in ${enrollment.siwesSession.name}`,
          createdAt: enrollment.enrolledAt,
        });
      }

      // Process assignments
      for (const assignment of recentAssignments) {
        activities.push({
          id: assignment.id,
          userType: "ADMIN",
          action: "ASSIGNED_SUPERVISOR",
          entityType: "StudentSupervisorAssignment",
          entityId: assignment.id,
          details: `${assignment.student.name} assigned to supervisor ${assignment.schoolSupervisor.name} for ${assignment.siwesSession.name}`,
          createdAt: assignment.assignedAt,
        });
      }

      // Process industry supervisor comments
      for (const comment of recentIndustryComments) {
        activities.push({
          id: comment.id,
          userType: "INDUSTRY_SUPERVISOR",
          action: "COMMENTED",
          entityType: "IndustrySupervisorWeeklyComment",
          entityId: comment.id,
          details: `${comment.industrySupervisor.name} commented on ${comment.weeklyEntry.student.name}'s week ${comment.weeklyEntry.weekNumber}`,
          createdAt: comment.commentedAt,
        });
      }

      // Process school supervisor comments
      for (const comment of recentSchoolComments) {
        activities.push({
          id: comment.id,
          userType: "SCHOOL_SUPERVISOR",
          action: "COMMENTED",
          entityType: "SchoolSupervisorWeeklyComment",
          entityId: comment.id,
          details: `${comment.schoolSupervisor.name} commented on ${comment.weeklyEntry.student.name}'s week ${comment.weeklyEntry.weekNumber}`,
          createdAt: comment.commentedAt,
        });
      }
      }

      // Sort all activities by createdAt and limit to requested number
      activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return activities.slice(0, limit);
    } catch (error) {
      logger.error("Failed to get recent activities", { error });
      // Return empty array if we fail to get activities
      return [];
    }
  }
}

export const adminDashboardService = new AdminDashboardService();
