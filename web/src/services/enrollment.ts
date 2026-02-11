import { getLogger } from "@/lib/logger";
import {
  logbookMetadataRepository,
  schoolSupervisorRepository,
  siwesSessionRepository,
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSupervisorAssignmentRepository,
  supervisorSessionEnrollmentRepository,
  weeklyEntryRepository,
} from "@/repositories";

const logger = getLogger(["services", "enrollment"]);

/**
 * Enrollment Service - Business logic for session enrollment management
 */
export class EnrollmentService {
  /**
   * Get session enrollments (students and supervisors)
   */
  async getSessionEnrollments(sessionId: string) {
    logger.info("Getting session enrollments", { sessionId });

    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("Session not found");
    }

    const studentEnrollments =
      await studentSessionEnrollmentRepository.findManyBySession(sessionId);
    const supervisorEnrollments =
      await supervisorSessionEnrollmentRepository.findManyBySession(sessionId);

    return {
      session,
      students: studentEnrollments,
      supervisors: supervisorEnrollments,
    };
  }

  /**
   * Add student to session
   */
  async addStudentToSession(studentId: string, sessionId: string) {
    logger.info("Adding student to session", { studentId, sessionId });

    // Verify student exists
    const student = await studentRepository.prisma.findUnique({
      where: { id: studentId },
      include: {
        department: true,
      },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Verify session exists
    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("Session not found");
    }

    // Check if already enrolled
    const existing =
      await studentSessionEnrollmentRepository.findByStudentAndSession(
        studentId,
        sessionId,
      );

    if (existing) {
      throw new Error("Student already enrolled in this session");
    }

    // Create enrollment
    const enrollment = await studentSessionEnrollmentRepository.prisma.create({
      data: {
        student: {
          connect: { id: studentId },
        },
        siwesSession: {
          connect: { id: sessionId },
        },
        enrolledAt: new Date(),
      },
    });

    // Create logbook metadata for all weeks
    await this.createLogbookForStudent(
      studentId,
      sessionId,
      session.totalWeeks,
    );

    logger.info("Student enrolled successfully", {
      studentId,
      sessionId,
      enrollmentId: enrollment.id,
    });

    return enrollment;
  }

  /**
   * Remove student from session
   */
  async removeStudentFromSession(enrollmentId: string) {
    logger.info("Removing student from session", { enrollmentId });

    const enrollment =
      await studentSessionEnrollmentRepository.prisma.findUnique({
        where: { id: enrollmentId },
      });
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Delete associated logbook metadata
    const logbookMetadata =
      await logbookMetadataRepository.findByStudentAndSession(
        enrollment.studentId,
        enrollment.siwesSessionId,
      );
    if (logbookMetadata) {
      await logbookMetadataRepository.delete(logbookMetadata.id);
    }

    return studentSessionEnrollmentRepository.prisma.delete({
      where: { id: enrollmentId },
    });
  }

  /**
   * Add supervisor to session
   */
  async addSupervisorToSession(supervisorId: string, sessionId: string) {
    logger.info("Adding supervisor to session", { supervisorId, sessionId });

    // Verify supervisor exists
    const supervisor = await schoolSupervisorRepository.prisma.findUnique({
      where: { id: supervisorId },
    });
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }

    // Verify session exists
    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("Session not found");
    }

    // Check if already enrolled
    const existing =
      await supervisorSessionEnrollmentRepository.findBySupervisorAndSession(
        supervisorId,
        sessionId,
      );

    if (existing) {
      throw new Error("Supervisor already enrolled in this session");
    }

    // Create enrollment
    return supervisorSessionEnrollmentRepository.prisma.create({
      data: {
        schoolSupervisor: {
          connect: { id: supervisorId },
        },
        siwesSession: {
          connect: { id: sessionId },
        },
        enrolledAt: new Date(),
      },
    });
  }

  /**
   * Remove supervisor from session
   */
  async removeSupervisorFromSession(enrollmentId: string) {
    logger.info("Removing supervisor from session", { enrollmentId });

    const enrollment =
      await supervisorSessionEnrollmentRepository.prisma.findUnique({
        where: { id: enrollmentId },
      });
    if (!enrollment) {
      throw new Error("Supervisor enrollment not found");
    }

    // Check if supervisor has assigned students
    const assignedStudents =
      await studentSupervisorAssignmentRepository.getSupervisorWorkload(
        enrollment.schoolSupervisorId,
        enrollment.siwesSessionId,
      );

    if (assignedStudents > 0) {
      throw new Error(
        `Cannot remove supervisor. ${assignedStudents} student(s) still assigned.`,
      );
    }

    return supervisorSessionEnrollmentRepository.prisma.delete({
      where: { id: enrollmentId },
    });
  }

  /**
   * Bulk enroll students
   */
  async bulkEnrollStudents(sessionId: string, studentIds: string[]) {
    logger.info("Bulk enrolling students", {
      sessionId,
      count: studentIds.length,
    });

    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("Session not found");
    }

    const results = {
      success: [] as string[],
      errors: [] as { studentId: string; error: string }[],
    };

    for (const studentId of studentIds) {
      try {
        await this.addStudentToSession(studentId, sessionId);
        results.success.push(studentId);
      } catch (error) {
        results.errors.push({
          studentId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    logger.info("Bulk enrollment completed", {
      sessionId,
      total: studentIds.length,
      success: results.success.length,
      errors: results.errors.length,
    });

    return results;
  }

  /**
   * Bulk enroll supervisors
   */
  async bulkEnrollSupervisors(sessionId: string, supervisorIds: string[]) {
    logger.info("Bulk enrolling supervisors", {
      sessionId,
      count: supervisorIds.length,
    });

    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("Session not found");
    }

    const results = {
      success: [] as string[],
      errors: [] as { supervisorId: string; error: string }[],
    };

    for (const supervisorId of supervisorIds) {
      try {
        await this.addSupervisorToSession(supervisorId, sessionId);
        results.success.push(supervisorId);
      } catch (error) {
        results.errors.push({
          supervisorId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    logger.info("Bulk supervisor enrollment completed", {
      sessionId,
      total: supervisorIds.length,
      success: results.success.length,
      errors: results.errors.length,
    });

    return results;
  }

  /**
   * Create logbook metadata for all weeks when student enrolls
   */
  private async createLogbookForStudent(
    studentId: string,
    sessionId: string,
    totalWeeks: number,
  ) {
    logger.info("Creating logbook for student", {
      studentId,
      sessionId,
      totalWeeks,
    });

    const session = await siwesSessionRepository.prisma.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new Error("Session not found");
    }

    // Get student details for logbook metadata
    const student = await studentRepository.prisma.findUnique({
      where: { id: studentId },
      include: {
        department: true,
      },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Create logbook metadata with required fields
    await logbookMetadataRepository.create({
      student: {
        connect: { id: studentId },
      },
      siwesSession: {
        connect: { id: sessionId },
      },
      programOfStudy: student.department.name,
      level: "400", // Default level, should be configurable
      session: session.name,
      trainingDuration: `${totalWeeks} weeks`,
    });

    // Create weekly entry placeholders for all weeks
    const weekPromises = [];
    for (let weekNumber = 1; weekNumber <= totalWeeks; weekNumber++) {
      weekPromises.push(
        weeklyEntryRepository.prisma.create({
          data: {
            student: {
              connect: { id: studentId },
            },
            siwesSession: {
              connect: { id: sessionId },
            },
            weekNumber,
            isLocked: false,
          },
        }),
      );
    }

    await Promise.all(weekPromises);

    logger.info("Logbook created successfully", {
      studentId,
      sessionId,
      weeksCreated: totalWeeks,
    });
  }
}

export const enrollmentService = new EnrollmentService();
