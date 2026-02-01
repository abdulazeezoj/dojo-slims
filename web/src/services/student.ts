import { getLogger } from "@/lib/logger";
import {
  assignmentRepository,
  siwesDetailRepository,
  studentEnrollmentRepository,
  studentRepository,
} from "@/repositories";

const logger = getLogger(["services", "student"]);

/**
 * Student Service - Business logic for student operations
 */
export class StudentService {
  /**
   * Get student dashboard data with session information
   */
  async getStudentDashboard(studentId: string, sessionId?: string) {
    logger.info("Getting student dashboard", { studentId, sessionId });

    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get all sessions student is enrolled in
    const enrollments =
      await studentEnrollmentRepository.findByStudent(studentId);

    // Determine active session
    let activeEnrollment;
    if (sessionId) {
      activeEnrollment = enrollments.find(
        (e) => e.siwesSessionId === sessionId,
      );
    } else {
      // Get most recent active session
      activeEnrollment = enrollments
        .filter((e) => e.siwesSession.status === "ACTIVE")
        .sort(
          (a, b) =>
            new Date(b.siwesSession.startDate).getTime() -
            new Date(a.siwesSession.startDate).getTime(),
        )[0];
    }

    if (!activeEnrollment) {
      return {
        student,
        sessions: enrollments.map((e) => e.siwesSession),
        activeSession: null,
        enrollmentInfo: null,
        alerts: [],
      };
    }

    // Get enrollment details with related data
    const enrollmentInfo =
      await studentEnrollmentRepository.findByStudentAndSession(
        studentId,
        activeEnrollment.siwesSessionId,
      );

    // Generate alerts
    const alerts = await this.generateStudentAlerts(
      studentId,
      activeEnrollment.siwesSessionId,
    );

    return {
      student,
      sessions: enrollments.map((e) => e.siwesSession),
      activeSession: activeEnrollment.siwesSession,
      enrollmentInfo,
      alerts,
    };
  }

  /**
   * Get student profile
   */
  async getStudentProfile(studentId: string) {
    logger.info("Getting student profile", { studentId });

    const student = await studentRepository.findById(studentId);
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
    studentId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    logger.info("Updating student profile", { studentId, data });

    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Currently only name and email can be updated
    // Add more fields as needed when schema is extended
    return studentRepository.update(studentId, data);
  }

  /**
   * Get all sessions student is enrolled in
   */
  async getStudentSessions(studentId: string) {
    logger.info("Getting student sessions", { studentId });

    const enrollments =
      await studentEnrollmentRepository.findByStudent(studentId);

    // Fetch supervisor assignments for each session
    const sessionsWithSupervisors = await Promise.all(
      enrollments.map(async (enrollment) => {
        const assignments = await assignmentRepository.findByStudentSession(
          studentId,
          enrollment.siwesSessionId,
        );

        return {
          ...enrollment.siwesSession,
          enrollmentId: enrollment.id,
          schoolSupervisor: assignments[0]?.schoolSupervisor || null,
        };
      }),
    );

    return sessionsWithSupervisors;
  }

  /**
   * Generate alerts for student dashboard
   */
  private async generateStudentAlerts(
    studentId: string,
    sessionId: string,
  ): Promise<
    Array<{
      id: string;
      type: "warning" | "info" | "error";
      message: string;
      priority: number;
    }>
  > {
    const alerts: Array<{
      id: string;
      type: "warning" | "info" | "error";
      message: string;
      priority: number;
    }> = [];

    // Check if SIWES details are complete
    const siwesDetail = await siwesDetailRepository.findByStudentSession(
      studentId,
      sessionId,
    );

    if (!siwesDetail) {
      alerts.push({
        id: "siwes-details-missing",
        type: "error",
        message:
          "Please complete your SIWES details including placement organization and industry supervisor information",
        priority: 1,
      });
    }

    // Check for school supervisor assignment
    const assignments = await assignmentRepository.findByStudentSession(
      studentId,
      sessionId,
    );

    if (assignments.length === 0) {
      alerts.push({
        id: "supervisor-not-assigned",
        type: "warning",
        message:
          "School supervisor not yet assigned. Contact SIWES Unit if this persists.",
        priority: 2,
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
        message: `${pendingReviews} week(s) awaiting industry supervisor review`,
        priority: 3,
      });
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get count of weeks pending review
   */
  private async getPendingReviewCount(
    studentId: string,
    sessionId: string,
  ): Promise<number> {
    // This will be implemented when we have review request repository
    // For now, return 0
    return 0;
  }
}

export const studentService = new StudentService();
