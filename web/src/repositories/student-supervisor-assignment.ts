import type {
  Prisma,
  StudentSupervisorAssignment,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Type Definitions
 */

/**
 * Interface for pagination parameters
 */
interface PaginationParams {
  skip?: number;
  take?: number;
}

/**
 * Student Supervisor Assignment with full relation details
 */
type AssignmentWithDetails = Prisma.StudentSupervisorAssignmentGetPayload<{
  include: {
    student: {
      include: {
        user: true;
        department: {
          include: {
            faculty: true;
          };
        };
      };
    };
    schoolSupervisor: {
      include: {
        user: true;
        department: {
          include: {
            faculty: true;
          };
        };
      };
    };
    siwesSession: true;
    admin: {
      include: {
        user: true;
      };
    };
  };
}>;

/**
 * Student Supervisor Assignment Repository
 *
 * Handles assignment of students to school supervisors for SIWES sessions.
 * MVP Feature: #30 (Student supervisor assignment)
 */
export class StudentSupervisorAssignmentRepository {
  readonly prisma = prisma.studentSupervisorAssignment;

  // ==================== Custom Methods ====================

  /**
   * Assign a student to a supervisor
   * @feature #30 Student Supervisor Assignment
   */
  async assignStudentToSupervisor(
    data: Prisma.StudentSupervisorAssignmentCreateInput,
  ): Promise<StudentSupervisorAssignment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Bulk assign students to supervisors
   * @feature #30 Student Supervisor Assignment
   */
  async assignStudentsBulk(
    data: Prisma.StudentSupervisorAssignmentCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Auto-assign students by department (distribute evenly)
   * This method helps with bulk assignment logic
   * @feature #30 Student Supervisor Assignment
   */
  async assignStudentsByDepartment(
    departmentId: string,
    siwesSessionId: string,
    assignedBy: string,
  ): Promise<number> {
    // Get unassigned students from the department
    const unassignedStudents = await prisma.student.findMany({
      where: {
        departmentId,
        studentSessionEnrollments: {
          some: {
            siwesSessionId,
          },
        },
        studentSupervisorAssignments: {
          none: {
            siwesSessionId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (unassignedStudents.length === 0) {
      return 0;
    }

    // Get available supervisors from the same department
    const availableSupervisors = await prisma.schoolSupervisor.findMany({
      where: {
        departmentId,
        isActive: true,
        supervisorSessionEnrollments: {
          some: {
            siwesSessionId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (availableSupervisors.length === 0) {
      return 0;
    }

    // Distribute students evenly across supervisors
    const assignments: Prisma.StudentSupervisorAssignmentCreateManyInput[] = [];
    unassignedStudents.forEach((student, index) => {
      const supervisorIndex = index % availableSupervisors.length;
      const supervisor = availableSupervisors[supervisorIndex];

      assignments.push({
        studentId: student.id,
        schoolSupervisorId: supervisor.id,
        siwesSessionId,
        assignedBy,
        assignmentMethod: "AUTOMATIC",
        assignedAt: new Date(),
      });
    });

    return this.assignStudentsBulk(assignments);
  }

  /**
   * Find assignment by student and session
   * @feature #30 Student Supervisor Assignment
   */
  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<AssignmentWithDetails | null> {
    return this.prisma.findFirst({
      where: {
        studentId,
        siwesSessionId,
      },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        schoolSupervisor: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Find all assignments for a supervisor with pagination
   * @feature #30 Student Supervisor Assignment
   */
  async findManyBySupervisor(
    schoolSupervisorId: string,
    filters?: {
      siwesSessionId?: string;
      departmentId?: string;
    },
    params?: PaginationParams,
  ): Promise<AssignmentWithDetails[]> {
    return this.prisma.findMany({
      where: {
        schoolSupervisorId,
        ...(filters?.siwesSessionId && {
          siwesSessionId: filters.siwesSessionId,
        }),
        ...(filters?.departmentId && {
          student: {
            departmentId: filters.departmentId,
          },
        }),
      },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        schoolSupervisor: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: {
          include: {
            user: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        assignedAt: "desc",
      },
    });
  }

  /**
   * Find all assignments for a session with pagination
   * @feature #30 Student Supervisor Assignment
   */
  async findManyBySession(
    siwesSessionId: string,
    filters?: {
      departmentId?: string;
      schoolSupervisorId?: string;
    },
    params?: PaginationParams,
  ): Promise<AssignmentWithDetails[]> {
    return this.prisma.findMany({
      where: {
        siwesSessionId,
        ...(filters?.departmentId && {
          student: {
            departmentId: filters.departmentId,
          },
        }),
        ...(filters?.schoolSupervisorId && {
          schoolSupervisorId: filters.schoolSupervisorId,
        }),
      },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        schoolSupervisor: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: {
          include: {
            user: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        assignedAt: "desc",
      },
    });
  }

  /**
   * Count assignments by supervisor
   * @feature #30 Student Supervisor Assignment
   */
  async countBySupervisor(
    schoolSupervisorId: string,
    siwesSessionId?: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        schoolSupervisorId,
        ...(siwesSessionId && { siwesSessionId }),
      },
    });
  }

  /**
   * Count assignments by session
   * @feature #30 Student Supervisor Assignment
   */
  async countBySession(siwesSessionId: string): Promise<number> {
    return this.prisma.count({
      where: { siwesSessionId },
    });
  }

  /**
   * Reassign a student to a different supervisor
   * @feature #30 Student Supervisor Assignment
   */
  async reassignStudent(
    id: string,
    newSchoolSupervisorId: string,
    assignedBy: string,
  ): Promise<StudentSupervisorAssignment> {
    return this.prisma.update({
      where: { id },
      data: {
        schoolSupervisorId: newSchoolSupervisorId,
        assignedBy,
        assignmentMethod: "MANUAL",
        assignedAt: new Date(),
      },
    });
  }

  /**
   * Delete an assignment
   * @feature #30 Student Supervisor Assignment
   */
  async delete(id: string): Promise<StudentSupervisorAssignment> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Check if assignment exists
   * @feature #30 Student Supervisor Assignment
   */
  async exists(studentId: string, siwesSessionId: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: {
        studentId,
        siwesSessionId,
      },
    });
    return count > 0;
  }

  /**
   * Get supervisor workload (number of assigned students)
   * @feature #30 Student Supervisor Assignment
   */
  async getSupervisorWorkload(
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<number> {
    return this.countBySupervisor(schoolSupervisorId, siwesSessionId);
  }
}

export const studentSupervisorAssignmentRepository =
  new StudentSupervisorAssignmentRepository();
