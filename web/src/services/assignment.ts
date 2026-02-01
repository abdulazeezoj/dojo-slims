import { getLogger } from "@/lib/logger";
import {
  assignmentRepository,
  schoolSupervisorRepository,
  studentEnrollmentRepository,
  studentRepository,
} from "@/repositories";

const logger = getLogger(["services", "assignment"]);

/**
 * Assignment Service - Business logic for student-supervisor assignments
 */
export class AssignmentService {
  /**
   * Get all assignments for a session
   */
  async getAssignments(sessionId: string) {
    logger.info("Getting assignments", { sessionId });

    return assignmentRepository.findBySession(sessionId);
  }

  /**
   * Manual assignment of student to school supervisor
   */
  async manualAssignment(
    studentId: string,
    supervisorId: string,
    sessionId: string,
    adminId: string,
  ) {
    logger.info("Manual assignment", { studentId, supervisorId, sessionId });

    // Verify student exists
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Verify supervisor exists
    const supervisor = await schoolSupervisorRepository.findById(supervisorId);
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }

    // Verify student is enrolled in the session
    const enrollment = await studentEnrollmentRepository.findMany({
      where: {
        studentId,
        siwesSessionId: sessionId,
      },
    });

    if (enrollment.length === 0) {
      throw new Error("Student is not enrolled in this session");
    }

    // Check if assignment already exists
    const existingAssignment =
      await assignmentRepository.findByStudentSupervisorSession(
        studentId,
        supervisorId,
        sessionId,
      );

    if (existingAssignment) {
      throw new Error("Student is already assigned to this supervisor");
    }

    // Create assignment
    const assignment = await assignmentRepository.create({
      student: { connect: { id: studentId } },
      schoolSupervisor: { connect: { id: supervisorId } },
      siwesSession: { connect: { id: sessionId } },
      admin: { connect: { id: adminId } },
      assignmentMethod: "MANUAL",
      assignedAt: new Date(),
    });

    logger.info("Manual assignment completed", {
      studentId,
      supervisorId,
      sessionId,
      assignmentId: assignment.id,
    });

    return assignment;
  }

  /**
   * Automatic assignment by department
   */
  async autoAssignByDepartment(
    sessionId: string,
    adminId: string,
    criteria?: {
      maxStudentsPerSupervisor?: number;
    },
  ) {
    logger.info("Auto-assign by department", { sessionId, criteria });

    const maxStudents = criteria?.maxStudentsPerSupervisor || 10;

    // Get all enrolled students for the session
    const enrollments = await studentEnrollmentRepository.findMany({
      where: {
        siwesSessionId: sessionId,
      },
    });

    if (enrollments.length === 0) {
      return {
        success: true,
        message: "No students enrolled in this session",
        assigned: 0,
      };
    }

    // Get existing assignments for this session
    const existingAssignments =
      await assignmentRepository.findBySession(sessionId);
    const assignedStudentIds = new Set(
      existingAssignments.map((a) => a.studentId),
    );

    // Filter to unassigned students
    const unassignedEnrollments = enrollments.filter(
      (e) => !assignedStudentIds.has(e.studentId),
    );

    if (unassignedEnrollments.length === 0) {
      return {
        success: true,
        message: "No unassigned students found",
        assigned: 0,
      };
    }

    // Get student details with department
    const studentsWithDept = await Promise.all(
      unassignedEnrollments.map(async (enrollment) => {
        const student = await studentRepository.findById(enrollment.studentId);
        return { enrollment, student };
      }),
    );

    // Group students by department
    const studentsByDept = studentsWithDept.reduce(
      (acc, { enrollment, student }) => {
        if (!student) return acc;
        const deptId = student.departmentId;
        if (!acc[deptId]) {
          acc[deptId] = [];
        }
        acc[deptId].push({ enrollment, student });
        return acc;
      },
      {} as Record<string, typeof studentsWithDept>,
    );

    let totalAssigned = 0;

    // Assign students in each department
    for (const [deptId, students] of Object.entries(studentsByDept)) {
      // Get available supervisors in this department
      const supervisors =
        await schoolSupervisorRepository.findByDepartment(deptId);

      if (supervisors.length === 0) {
        logger.warn("No supervisors available for department", {
          departmentId: deptId,
        });
        continue;
      }

      // Get current workload for each supervisor in this session
      const supervisorWorkloads = await Promise.all(
        supervisors.map(async (supervisor) => {
          const count = await assignmentRepository.getSupervisorWorkload(
            supervisor.id,
            sessionId,
          );
          return {
            supervisorId: supervisor.id,
            currentStudents: count,
          };
        }),
      );

      // Sort by current workload (assign to least loaded first)
      supervisorWorkloads.sort((a, b) => a.currentStudents - b.currentStudents);

      // Assign students round-robin style
      let supervisorIndex = 0;
      for (const { student } of students) {
        // Skip if student data couldn't be loaded
        if (!student) {
          logger.warn("Student data not found, skipping");
          continue;
        }

        const supervisor = supervisorWorkloads[supervisorIndex];

        // Skip if supervisor is at max capacity
        if (supervisor.currentStudents >= maxStudents) {
          supervisorIndex = (supervisorIndex + 1) % supervisorWorkloads.length;
          // Check if all supervisors are at capacity
          const allAtCapacity = supervisorWorkloads.every(
            (s) => s.currentStudents >= maxStudents,
          );
          if (allAtCapacity) {
            logger.warn("All supervisors at capacity for department", {
              departmentId: deptId,
            });
            break;
          }
          continue;
        }

        // Create assignment
        await assignmentRepository.create({
          student: { connect: { id: student.id } },
          schoolSupervisor: { connect: { id: supervisor.supervisorId } },
          siwesSession: { connect: { id: sessionId } },
          admin: { connect: { id: adminId } },
          assignmentMethod: "AUTOMATIC",
          assignedAt: new Date(),
        });

        supervisor.currentStudents++;
        totalAssigned++;

        // Move to next supervisor
        supervisorIndex = (supervisorIndex + 1) % supervisorWorkloads.length;
      }
    }

    logger.info("Auto-assignment completed", {
      sessionId,
      totalAssigned,
      total: unassignedEnrollments.length,
    });

    return {
      success: true,
      message: `Assigned ${totalAssigned} out of ${unassignedEnrollments.length} students`,
      assigned: totalAssigned,
      total: unassignedEnrollments.length,
    };
  }

  /**
   * Unassign student from supervisor
   */
  async unassignStudent(
    studentId: string,
    supervisorId: string,
    sessionId: string,
  ) {
    logger.info("Unassigning student", {
      studentId,
      supervisorId,
      sessionId,
    });

    const assignment =
      await assignmentRepository.findByStudentSupervisorSession(
        studentId,
        supervisorId,
        sessionId,
      );

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    return assignmentRepository.delete(assignment.id);
  }

  /**
   * Get supervisor workload
   */
  async getSupervisorWorkload(supervisorId: string, sessionId?: string) {
    logger.info("Getting supervisor workload", { supervisorId, sessionId });

    if (sessionId) {
      // Get workload for specific session
      const assignments = await assignmentRepository.findBySupervisorSession(
        supervisorId,
        sessionId,
      );

      return {
        supervisorId,
        sessionId,
        totalStudents: assignments.length,
        assignments,
      };
    }

    // Get overall workload across all sessions
    const assignments =
      await assignmentRepository.findBySupervisor(supervisorId);

    // The repository includes siwesSession relation, but TypeScript doesn't know that
    // Cast to access the included relation
    const assignmentsWithSession = assignments as Array<
      (typeof assignments)[0] & { siwesSession: { status: string } }
    >;

    const activeSessions = assignmentsWithSession.filter(
      (a) => a.siwesSession.status === "ACTIVE",
    );
    const closedSessions = assignmentsWithSession.filter(
      (a) => a.siwesSession.status === "CLOSED",
    );

    return {
      supervisorId,
      totalStudents: assignments.length,
      activeStudents: activeSessions.length,
      historicalStudents: closedSessions.length,
      activeAssignments: activeSessions,
    };
  }
}

export const assignmentService = new AssignmentService();
