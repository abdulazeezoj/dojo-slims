import type { StudentSessionEnrollment } from "@/generated/prisma/client";
import { getLogger } from "@/lib/logger";
import {
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSiwesDetailRepository,
  studentSupervisorAssignmentRepository,
  weeklyEntryRepository,
} from "@/repositories";

const logger = getLogger(["services", "student"]);

/**
 * Student Service - Business logic for student operations
 */
export class StudentService {
  /**
   * Get student dashboard data with session information
   * @feature #5 Student Dashboard with Session Switching & Alerts
   */
  async getStudentDashboard(userId: string, sessionId?: string) {
    logger.info(
      `Getting student dashboard for userId=${userId}, sessionId=${sessionId}`,
    );

    // Find student by userId (from Better Auth) with all dashboard data
    const student = await studentRepository.findDashboardDataByUserId(userId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get all sessions student is enrolled in
    const enrollments = student.studentSessionEnrollments;

    // Determine active session with priority:
    // 1. Explicitly provided sessionId parameter
    // 2. Student's persisted currentSiwesSessionId
    // 3. Most recent ACTIVE session
    let activeEnrollment: (typeof enrollments)[0] | undefined;
    if (sessionId) {
      // Priority 1: Explicit sessionId parameter
      activeEnrollment = enrollments.find(
        (e: StudentSessionEnrollment & { siwesSession: { status: string } }) =>
          e.siwesSessionId === sessionId,
      );
    } else if (student.currentSiwesSessionId) {
      // Priority 2: Student's persisted current session
      activeEnrollment = enrollments.find(
        (e: StudentSessionEnrollment) =>
          e.siwesSessionId === student.currentSiwesSessionId,
      );
    } else {
      // Priority 3: Fallback to most recent ACTIVE session
      activeEnrollment = enrollments
        .filter(
          (
            e: StudentSessionEnrollment & { siwesSession: { status: string } },
          ) => e.siwesSession.status === "ACTIVE",
        )
        .sort(
          (
            a: StudentSessionEnrollment & {
              siwesSession: { startDate: Date };
            },
            b: StudentSessionEnrollment & {
              siwesSession: { startDate: Date };
            },
          ) =>
            new Date(b.siwesSession.startDate).getTime() -
            new Date(a.siwesSession.startDate).getTime(),
        )[0];
    }

    if (!activeEnrollment) {
      return {
        student,
        sessions: enrollments.map(
          (e: StudentSessionEnrollment & { siwesSession: unknown }) =>
            e.siwesSession,
        ),
        activeSession: null,
        enrollmentInfo: null,
        stats: null,
        placementInfo: null,
        alerts: [],
      };
    }

    // Get enrollment details with related data
    const enrollmentInfo =
      await studentSessionEnrollmentRepository.findByStudentAndSession(
        student.id,
        activeEnrollment.siwesSessionId,
      );

    // Calculate stats from weekly entries
    const stats = await this.calculateDashboardStats(
      student.id,
      activeEnrollment.siwesSessionId,
    );

    // Format placement information
    const placementInfo = await this.getPlacementInfo(
      student.id,
      activeEnrollment.siwesSessionId,
    );

    // Generate alerts
    const alerts = await this.generateStudentAlerts(
      student.id,
      activeEnrollment.siwesSessionId,
    );

    return {
      student,
      sessions: enrollments.map(
        (e: StudentSessionEnrollment & { siwesSession: unknown }) =>
          e.siwesSession,
      ),
      activeSession: activeEnrollment.siwesSession,
      enrollmentInfo,
      stats,
      placementInfo,
      alerts,
    };
  }

  /**
   * Get student profile
   */
  async getStudentProfile(userId: string) {
    logger.info("Getting student profile", { userId });

    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }

  /**
   * Update student profile (limited fields)
   * Note: Currently Student model doesn't have phoneNumber/address fields
   * This is a placeholder for future profile updates
   */
  async updateStudentProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    logger.info("Updating student profile", { userId, data });

    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Currently only name and email can be updated
    // Add more fields as needed when schema is extended
    return studentRepository.updateProfile(student.id, data);
  }

  /**
   * Set student's current SIWES session
   * @feature #5 Student Dashboard with Session Switching
   */
  async setCurrentSession(userId: string, sessionId: string): Promise<void> {
    logger.info("Setting current session", { userId, sessionId });

    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Verify student is enrolled in the target session
    const enrollment =
      await studentSessionEnrollmentRepository.findByStudentAndSession(
        student.id,
        sessionId,
      );
    if (!enrollment) {
      throw new Error(
        "Cannot set session: Student is not enrolled in this session",
      );
    }

    // Persist the selection
    await studentRepository.updateCurrentSession(student.id, sessionId);
    logger.info("Current session updated successfully", {
      userId,
      studentId: student.id,
      sessionId,
    });
  }

  /**
   * Get all sessions student is enrolled in
   */
  async getStudentSessions(userId: string) {
    logger.info("Getting student sessions", { userId });

    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new Error("Student not found");
    }

    const enrollments =
      await studentSessionEnrollmentRepository.findManyByStudent(student.id);

    // Fetch supervisor assignments for each session
    const sessionsWithSupervisors = await Promise.all(
      enrollments.map(
        async (
          enrollment: StudentSessionEnrollment & {
            siwesSession: Record<string, unknown>;
          },
        ) => {
          const assignment =
            await studentSupervisorAssignmentRepository.findByStudentAndSession(
              student.id,
              enrollment.siwesSessionId,
            );

          return {
            ...(enrollment.siwesSession as object),
            enrollmentId: enrollment.id,
            schoolSupervisor: assignment?.schoolSupervisor || null,
          };
        },
      ),
    );

    return sessionsWithSupervisors;
  }

  /**
   * Calculate dashboard statistics from weekly entries
   * @feature #5 Student Dashboard - View entry progress
   */
  private async calculateDashboardStats(
    studentId: string,
    sessionId: string,
  ): Promise<{
    totalWeeks: number;
    completedWeeks: number;
    lockedWeeks: number;
    pendingReviews: number;
  }> {
    // Get all weekly entries for the session
    const weeklyEntries = await weeklyEntryRepository.findManyByStudentSession(
      studentId,
      sessionId,
    );

    // Count completed weeks (entries with at least Monday-Saturday filled)
    const completedWeeks = weeklyEntries.filter(
      (entry) =>
        entry.mondayEntry &&
        entry.tuesdayEntry &&
        entry.wednesdayEntry &&
        entry.thursdayEntry &&
        entry.fridayEntry &&
        entry.saturdayEntry,
    ).length;

    // Count locked weeks (either locked by school or industry supervisor)
    const lockedWeeks = weeklyEntries.filter(
      (entry) =>
        entry.isLocked &&
        (entry.lockedBy === "SCHOOL_SUPERVISOR" ||
          entry.lockedBy === "INDUSTRY_SUPERVISOR"),
    ).length;

    // Count pending reviews (review requested but not yet commented by industry supervisor)
    const pendingReviews = weeklyEntries.filter(
      (entry) =>
        entry.industrySupervisorReviewRequest &&
        entry.industrySupervisorWeeklyComments.length === 0,
    ).length;

    // Get total weeks from session duration (or use entry count as fallback)
    const totalWeeks = weeklyEntries.length || 0;

    return {
      totalWeeks,
      completedWeeks,
      lockedWeeks,
      pendingReviews,
    };
  }

  /**
   * Get formatted placement information
   * @feature #5 Student Dashboard - View placement organization info
   */
  private async getPlacementInfo(
    studentId: string,
    sessionId: string,
  ): Promise<{
    organizationName: string;
    industrySupervisorName: string;
    schoolSupervisorName: string | null;
  } | null> {
    // Get SIWES details with placement organization
    const siwesDetail =
      await studentSiwesDetailRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    if (!siwesDetail || !siwesDetail.placementOrganization) {
      return null;
    }

    // Get school supervisor assignment
    const assignment =
      await studentSupervisorAssignmentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    return {
      organizationName: siwesDetail.placementOrganization.name,
      industrySupervisorName:
        siwesDetail.industrySupervisor?.user?.name || "Not assigned",
      schoolSupervisorName: assignment?.schoolSupervisor?.user?.name || null,
    };
  }

  /**
   * Generate alerts for student dashboard
   * @feature #5 Student Dashboard - See alerts
   */
  private async generateStudentAlerts(
    studentId: string,
    sessionId: string,
  ): Promise<
    Array<{
      id: string;
      type: "warning" | "info" | "error" | "success";
      title: string;
      message: string;
      priority: number;
      createdAt: Date;
    }>
  > {
    const alerts: Array<{
      id: string;
      type: "warning" | "info" | "error" | "success";
      title: string;
      message: string;
      priority: number;
      createdAt: Date;
    }> = [];

    const now = new Date();

    // Check if SIWES details are complete
    const siwesDetail =
      await studentSiwesDetailRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    if (!siwesDetail) {
      alerts.push({
        id: "siwes-details-missing",
        type: "error",
        title: "SIWES Details Required",
        message:
          "Please complete your SIWES details including placement organization and industry supervisor information",
        priority: 1,
        createdAt: now,
      });
    }

    // Check for school supervisor assignment
    const assignment =
      await studentSupervisorAssignmentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    if (!assignment) {
      alerts.push({
        id: "supervisor-not-assigned",
        type: "warning",
        title: "School Supervisor Not Assigned",
        message:
          "School supervisor not yet assigned. Contact SIWES Unit if this persists.",
        priority: 2,
        createdAt: now,
      });
    }

    // Check for weeks pending review
    const pendingReviews = await this.getPendingReviewCount(
      studentId,
      sessionId,
    );
    if (pendingReviews > 0) {
      alerts.push({
        id: "pending-reviews",
        type: "info",
        title: "Pending Reviews",
        message: `${pendingReviews} week(s) awaiting industry supervisor review`,
        priority: 3,
        createdAt: now,
      });
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get count of weeks pending review
   * @feature #8 Student-Triggered Review Request
   */
  private async getPendingReviewCount(
    studentId: string,
    sessionId: string,
  ): Promise<number> {
    const weeklyEntries = await weeklyEntryRepository.findManyByStudentSession(
      studentId,
      sessionId,
    );

    return weeklyEntries.filter(
      (entry) =>
        entry.industrySupervisorReviewRequest &&
        entry.industrySupervisorWeeklyComments.length === 0,
    ).length;
  }
}

export const studentService = new StudentService();
