import { getLogger } from "@/lib/logger";
import type { SchoolSupervisorWithDetails } from "@/repositories";
import {
  adminUserRepository,
  departmentRepository,
  schoolSupervisorRepository,
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSupervisorAssignmentRepository,
  supervisorSessionEnrollmentRepository,
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

    return studentSupervisorAssignmentRepository.findManyBySession(sessionId);
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

    // Verify admin exists
    const admin = await adminUserRepository.prisma.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      throw new Error("Unauthorized: Admin not found");
    }

    if (!admin.isActive) {
      throw new Error("Unauthorized: Admin account is inactive");
    }

    // Verify student exists
    const student = await studentRepository.prisma.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Verify supervisor exists
    const supervisor = await schoolSupervisorRepository.prisma.findUnique({
      where: { id: supervisorId },
    });
    if (!supervisor) {
      throw new Error("School supervisor not found");
    }

    // Verify student is enrolled in the session
    const studentEnrollment =
      await studentSessionEnrollmentRepository.prisma.findMany({
        where: {
          studentId,
          siwesSessionId: sessionId,
        },
      });

    if (studentEnrollment.length === 0) {
      throw new Error("Student is not enrolled in this session");
    }

    // Verify supervisor is enrolled in the session
    const supervisorEnrollment =
      await supervisorSessionEnrollmentRepository.prisma.findMany({
        where: {
          schoolSupervisorId: supervisorId,
          siwesSessionId: sessionId,
        },
      });

    if (supervisorEnrollment.length === 0) {
      throw new Error(
        "Supervisor is not enrolled in this session. Please enroll the supervisor first.",
      );
    }

    // Check if assignment already exists
    const existingAssignment =
      await studentSupervisorAssignmentRepository.prisma.findFirst({
        where: {
          studentId,
          schoolSupervisorId: supervisorId,
          siwesSessionId: sessionId,
        },
      });

    if (existingAssignment) {
      throw new Error("Student is already assigned to this supervisor");
    }

    // Create assignment
    const assignment =
      await studentSupervisorAssignmentRepository.prisma.create({
        data: {
          student: { connect: { id: studentId } },
          schoolSupervisor: { connect: { id: supervisorId } },
          siwesSession: { connect: { id: sessionId } },
          admin: { connect: { id: adminId } },
          assignmentMethod: "MANUAL",
          assignedAt: new Date(),
        },
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
    logger.info("Auto assignment by department", { sessionId, adminId });

    // Verify admin exists
    const admin = await adminUserRepository.prisma.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      throw new Error("Unauthorized: Admin not found");
    }

    if (!admin.isActive) {
      throw new Error("Unauthorized: Admin account is inactive");
    }
    logger.info("Auto-assign by department", { sessionId, criteria });

    const maxStudents = criteria?.maxStudentsPerSupervisor || 10;

    // Get all enrolled students for the session
    const enrollments =
      await studentSessionEnrollmentRepository.prisma.findMany({
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
      await studentSupervisorAssignmentRepository.findManyBySession(sessionId);
    const assignedStudentIds = new Set(
      existingAssignments.map((a: { studentId: string }) => a.studentId),
    );

    // Filter to unassigned students
    const unassignedEnrollments = enrollments.filter(
      (e: { studentId: string }) => !assignedStudentIds.has(e.studentId),
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
      unassignedEnrollments.map(async (enrollment: { studentId: string }) => {
        const student = await studentRepository.prisma.findUnique({
          where: { id: enrollment.studentId },
          include: { department: true },
        });
        return { enrollment, student };
      }),
    );

    // Group students by department
    const studentsByDept = studentsWithDept.reduce(
      (
        acc: Record<
          string,
          Array<{
            enrollment: { studentId: string };
            student: (typeof studentsWithDept)[0]["student"];
          }>
        >,
        item,
      ) => {
        if (!item.student) {
          return acc;
        }
        const deptId = item.student.departmentId;
        if (!acc[deptId]) {
          acc[deptId] = [];
        }
        acc[deptId].push(item);
        return acc;
      },
      {} as Record<
        string,
        Array<{
          enrollment: { studentId: string };
          student: (typeof studentsWithDept)[0]["student"];
        }>
      >,
    );

    let totalAssigned = 0;

    // Assign students in each department
    for (const [deptId, students] of Object.entries(studentsByDept)) {
      // Get department with faculty information to ensure proper hierarchy
      const department = await departmentRepository.prisma.findUnique({
        where: { id: deptId },
        include: { faculty: true },
      });
      if (!department) {
        logger.warn("Department not found, skipping", { departmentId: deptId });
        continue;
      }

      // Get available supervisors in this department
      const allSupervisors =
        await schoolSupervisorRepository.findManyByDepartment(deptId);

      // Filter to ensure supervisors are from the same faculty
      // (Department codes might overlap across faculties)
      const supervisors = await Promise.all(
        allSupervisors.map(async (sup) => {
          const supDept = await departmentRepository.prisma.findUnique({
            where: { id: sup.departmentId },
            include: { faculty: true },
          });
          return { supervisor: sup, department: supDept };
        }),
      ).then(
        (
          results: {
            supervisor: SchoolSupervisorWithDetails;
            department: { facultyId: string } | null;
          }[],
        ) =>
          results
            .filter(
              ({ department: supDept }) =>
                supDept?.facultyId === department.facultyId,
            )
            .map(({ supervisor }) => supervisor),
      );

      if (supervisors.length === 0) {
        logger.warn("No supervisors available for department in same faculty", {
          departmentId: deptId,
          facultyId: department.facultyId,
        });
        continue;
      }

      // Create map of supervisor IDs for easy access
      const supervisorIds = supervisors.map(
        (s: SchoolSupervisorWithDetails) => s.id,
      );

      // Assign students round-robin style
      const _supervisorIndex = 0;
      for (const { student } of students as Array<{
        enrollment: { studentId: string };
        student: { id: string; departmentId: string } | null;
      }>) {
        // Skip if student data couldn't be loaded
        if (!student) {
          logger.warn("Student data not found, skipping");
          continue;
        }

        // Query fresh workload from database to avoid race conditions
        // This ensures accurate counts even with concurrent assignments
        const supervisorWorkloads = await Promise.all(
          supervisorIds.map(async (supId: string) => {
            const count =
              await studentSupervisorAssignmentRepository.getSupervisorWorkload(
                supId,
                sessionId,
              );
            return {
              supervisorId: supId,
              currentStudents: count,
            };
          }),
        );

        // Sort by current workload (assign to least loaded first)
        supervisorWorkloads.sort(
          (
            a: { supervisorId: string; currentStudents: number },
            b: { supervisorId: string; currentStudents: number },
          ) => a.currentStudents - b.currentStudents,
        );

        // Find first supervisor under capacity
        const availableSupervisor = supervisorWorkloads.find(
          (s: { supervisorId: string; currentStudents: number }) =>
            s.currentStudents < maxStudents,
        );

        if (!availableSupervisor) {
          logger.warn("All supervisors at capacity for department", {
            departmentId: deptId,
            facultyId: department.facultyId,
          });
          break;
        }

        // Create assignment
        await studentSupervisorAssignmentRepository.prisma.create({
          data: {
            student: { connect: { id: student.id } },
            schoolSupervisor: {
              connect: { id: availableSupervisor.supervisorId },
            },
            siwesSession: { connect: { id: sessionId } },
            admin: { connect: { id: adminId } },
            assignmentMethod: "AUTOMATIC",
            assignedAt: new Date(),
          },
        });

        totalAssigned++;
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
      await studentSupervisorAssignmentRepository.prisma.findFirst({
        where: {
          studentId,
          schoolSupervisorId: supervisorId,
          siwesSessionId: sessionId,
        },
      });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    return studentSupervisorAssignmentRepository.delete(assignment.id);
  }

  /**
   * Get supervisor workload
   */
  async getSupervisorWorkload(supervisorId: string, sessionId?: string) {
    logger.info("Getting supervisor workload", { supervisorId, sessionId });

    if (sessionId) {
      // Get workload for specific session
      const assignments =
        await studentSupervisorAssignmentRepository.findManyBySupervisor(
          supervisorId,
          { siwesSessionId: sessionId },
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
      await studentSupervisorAssignmentRepository.findManyBySupervisor(
        supervisorId,
      );

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
