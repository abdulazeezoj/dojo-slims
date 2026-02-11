import type {
  Prisma,
  SupervisorSessionEnrollment,
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
 * Supervisor Session Enrollment with full supervisor and session details
 */
type SupervisorEnrollmentWithDetails =
  Prisma.SupervisorSessionEnrollmentGetPayload<{
    include: {
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
    };
  }>;

/**
 * Supervisor Session Enrollment Repository
 *
 * Handles enrollment of school supervisors into SIWES sessions.
 * MVP Feature: #31 (Student and supervisor enrollment into sessions)
 */
export class SupervisorSessionEnrollmentRepository {
  readonly prisma = prisma.supervisorSessionEnrollment;

  // ==================== Custom Methods ====================

  /**
   * Find enrollment by supervisor and session
   * @feature #31 Student and Supervisor Enrollment
   */
  async findBySupervisorAndSession(
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<SupervisorEnrollmentWithDetails | null> {
    return this.prisma.findUnique({
      where: {
        schoolSupervisorId_siwesSessionId: {
          schoolSupervisorId,
          siwesSessionId,
        },
      },
      include: {
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
      },
    });
  }

  /**
   * Get all enrollments for a SIWES session with pagination
   * @feature #31 Student and Supervisor Enrollment
   */
  async findManyBySession(
    siwesSessionId: string,
    filters?: {
      departmentId?: string;
      facultyId?: string;
    },
    params?: PaginationParams,
  ): Promise<SupervisorEnrollmentWithDetails[]> {
    return this.prisma.findMany({
      where: {
        siwesSessionId,
        ...(filters?.departmentId && {
          schoolSupervisor: {
            departmentId: filters.departmentId,
          },
        }),
        ...(filters?.facultyId && {
          schoolSupervisor: {
            department: {
              facultyId: filters.facultyId,
            },
          },
        }),
      },
      include: {
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
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  /**
   * Get all enrollments for a supervisor
   * @feature #31 Student and Supervisor Enrollment
   */
  async findManyBySupervisor(
    schoolSupervisorId: string,
    params?: PaginationParams,
  ): Promise<SupervisorEnrollmentWithDetails[]> {
    return this.prisma.findMany({
      where: { schoolSupervisorId },
      include: {
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
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  /**
   * Enroll a supervisor in a SIWES session
   * @feature #31 Student and Supervisor Enrollment
   */
  async enrollSupervisor(
    data: Prisma.SupervisorSessionEnrollmentCreateInput,
  ): Promise<SupervisorSessionEnrollment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Bulk enroll supervisors in a SIWES session
   * @feature #31 Student and Supervisor Enrollment
   */
  async enrollSupervisorsBulk(
    data: Prisma.SupervisorSessionEnrollmentCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Unenroll a supervisor (delete enrollment)
   * @feature #31 Student and Supervisor Enrollment
   */
  async unenrollSupervisor(id: string): Promise<SupervisorSessionEnrollment> {
    return this.prisma.delete({
      where: { id },
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
        schoolSupervisor: {
          departmentId,
        },
      },
    });
  }

  /**
   * Count enrollments by supervisor
   * @feature #31 Student and Supervisor Enrollment
   */
  async countBySupervisor(schoolSupervisorId: string): Promise<number> {
    return this.prisma.count({
      where: { schoolSupervisorId },
    });
  }

  /**
   * Update enrollment data
   * @feature #31 Student and Supervisor Enrollment
   */
  async update(
    id: string,
    data: Prisma.SupervisorSessionEnrollmentUpdateInput,
  ): Promise<SupervisorSessionEnrollment> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }
}

export const supervisorSessionEnrollmentRepository =
  new SupervisorSessionEnrollmentRepository();
