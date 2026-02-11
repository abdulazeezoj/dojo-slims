import type {
  Prisma,
  StudentSessionEnrollment,
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
 * Student Session Enrollment with full student and session details
 */
type StudentEnrollmentWithDetails = Prisma.StudentSessionEnrollmentGetPayload<{
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
    siwesSession: true;
  };
}>;

/**
 * Student Session Enrollment Repository
 *
 * Handles enrollment of students into SIWES sessions.
 * MVP Feature: #31 (Student and supervisor enrollment into sessions)
 */
export class StudentSessionEnrollmentRepository {
  readonly prisma = prisma.studentSessionEnrollment;

  // ==================== Custom Methods ====================

  /**
   * Find enrollment by student and session
   * @feature #31 Student and Supervisor Enrollment
   */
  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<StudentEnrollmentWithDetails | null> {
    return this.prisma.findUnique({
      where: {
        studentId_siwesSessionId: {
          studentId,
          siwesSessionId,
        },
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
        siwesSession: true,
      },
    });
  }

  /**
   * Get all enrollments for a SIWES session with filters and pagination
   * @feature #31 Student and Supervisor Enrollment
   */
  async findManyBySession(
    siwesSessionId: string,
    filters?: {
      departmentId?: string;
      facultyId?: string;
    },
    params?: PaginationParams,
  ): Promise<StudentEnrollmentWithDetails[]> {
    return this.prisma.findMany({
      where: {
        siwesSessionId,
        ...(filters?.departmentId && {
          student: {
            departmentId: filters.departmentId,
          },
        }),
        ...(filters?.facultyId && {
          student: {
            department: {
              facultyId: filters.facultyId,
            },
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
        siwesSession: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  /**
   * Get all enrollments for a student
   * @feature #31 Student and Supervisor Enrollment
   */
  async findManyByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<StudentEnrollmentWithDetails[]> {
    return this.prisma.findMany({
      where: { studentId },
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
        siwesSession: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  /**
   * Enroll a student in a SIWES session
   * @feature #31 Student and Supervisor Enrollment
   */
  async enrollStudent(
    data: Prisma.StudentSessionEnrollmentCreateInput,
  ): Promise<StudentSessionEnrollment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Bulk enroll students in a SIWES session
   * @feature #31 Student and Supervisor Enrollment
   */
  async enrollStudentsBulk(
    data: Prisma.StudentSessionEnrollmentCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Unenroll a student (delete enrollment)
   * @feature #31 Student and Supervisor Enrollment
   */
  async unenrollStudent(id: string): Promise<StudentSessionEnrollment> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Unenroll a student by student ID and session ID
   * @feature #31 Student and Supervisor Enrollment
   */
  async unenrollStudentByIds(
    studentId: string,
    siwesSessionId: string,
  ): Promise<StudentSessionEnrollment> {
    return this.prisma.delete({
      where: {
        studentId_siwesSessionId: {
          studentId,
          siwesSessionId,
        },
      },
    });
  }

  /**
   * Count enrollments by session
   * @feature #31 Student and Supervisor Enrollment
   */
  async countBySession(siwesSessionId: string): Promise<number> {
    return this.prisma.count({
      where: { siwesSessionId },
    });
  }

  /**
   * Count enrollments by department
   * @feature #31 Student and Supervisor Enrollment
   */
  async countByDepartment(
    siwesSessionId: string,
    departmentId: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        siwesSessionId,
        student: {
          departmentId,
        },
      },
    });
  }

  /**
   * Update enrollment data
   * @feature #31 Student and Supervisor Enrollment
   */
  async update(
    id: string,
    data: Prisma.StudentSessionEnrollmentUpdateInput,
  ): Promise<StudentSessionEnrollment> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }
}

export const studentSessionEnrollmentRepository =
  new StudentSessionEnrollmentRepository();
