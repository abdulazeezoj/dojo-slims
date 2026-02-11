import type { Prisma, StudentSiwesDetail } from "@/generated/prisma/client";
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
 * Student SIWES Detail with all related information
 */
type StudentSiwesDetailWithRelations = Prisma.StudentSiwesDetailGetPayload<{
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
    placementOrganization: true;
    industrySupervisor: {
      include: {
        user: true;
        placementOrganization: true;
      };
    };
  };
}>;

/**
 * Student SIWES Detail Repository
 *
 * Handles student SIWES details including placement organization and industry supervisor assignment.
 * MVP Feature: #12 (Student SIWES details entry)
 */
export class StudentSiwesDetailRepository {
  readonly prisma = prisma.studentSiwesDetail;

  // ==================== Custom Methods ====================

  /**
   * Find SIWES detail by student and session
   * @feature #12 Student SIWES Details Entry
   */
  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<StudentSiwesDetailWithRelations | null> {
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
        placementOrganization: true,
        industrySupervisor: {
          include: {
            user: true,
            placementOrganization: true,
          },
        },
      },
    });
  }

  /**
   * Create SIWES detail for a student
   * @feature #12 Student SIWES Details Entry
   */
  async createSiwesDetail(
    data: Prisma.StudentSiwesDetailCreateInput,
  ): Promise<StudentSiwesDetail> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update supervisor assignments (industry and school)
   * @feature #12 Student SIWES Details Entry
   */
  async updateSupervisors(
    id: string,
    industrySupervisorId: string | null,
  ): Promise<StudentSiwesDetail> {
    return this.prisma.update({
      where: { id },
      data: {
        ...(industrySupervisorId && { industrySupervisorId }),
      },
    });
  }

  /**
   * Update placement organization
   * @feature #12 Student SIWES Details Entry
   */
  async updatePlacement(
    id: string,
    data: {
      placementOrganizationId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<StudentSiwesDetail> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Find all SIWES details for an industry supervisor with pagination
   * @feature #12 Student SIWES Details Entry
   */
  async findManyByIndustrySupervisor(
    industrySupervisorId: string,
    filters?: {
      siwesSessionId?: string;
    },
    params?: PaginationParams,
  ): Promise<StudentSiwesDetailWithRelations[]> {
    return this.prisma.findMany({
      where: {
        industrySupervisorId,
        ...(filters?.siwesSessionId && {
          siwesSessionId: filters.siwesSessionId,
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
        placementOrganization: true,
        industrySupervisor: {
          include: {
            user: true,
            placementOrganization: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find all SIWES details for students assigned to a school supervisor
   * This queries through the StudentSupervisorAssignment relationship
   * @feature #12 Student SIWES Details Entry
   */
  async findManyBySchoolSupervisor(
    schoolSupervisorId: string,
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<StudentSiwesDetailWithRelations[]> {
    // Get student IDs assigned to this school supervisor
    const assignments = await prisma.studentSupervisorAssignment.findMany({
      where: {
        schoolSupervisorId,
        siwesSessionId,
      },
      select: {
        studentId: true,
      },
    });

    const studentIds = assignments.map((a) => a.studentId);

    if (studentIds.length === 0) {
      return [];
    }

    return this.prisma.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
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
        siwesSession: true,
        placementOrganization: true,
        industrySupervisor: {
          include: {
            user: true,
            placementOrganization: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find all SIWES details by placement organization
   * @feature #12 Student SIWES Details Entry
   */
  async findManyByOrganization(
    placementOrganizationId: string,
    filters?: {
      siwesSessionId?: string;
    },
    params?: PaginationParams,
  ): Promise<StudentSiwesDetailWithRelations[]> {
    return this.prisma.findMany({
      where: {
        placementOrganizationId,
        ...(filters?.siwesSessionId && {
          siwesSessionId: filters.siwesSessionId,
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
        placementOrganization: true,
        industrySupervisor: {
          include: {
            user: true,
            placementOrganization: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find all SIWES details for a session
   * @feature #12 Student SIWES Details Entry
   */
  async findManyBySession(
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<StudentSiwesDetailWithRelations[]> {
    return this.prisma.findMany({
      where: { siwesSessionId },
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
        placementOrganization: true,
        industrySupervisor: {
          include: {
            user: true,
            placementOrganization: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Count SIWES details by industry supervisor
   * @feature #12 Student SIWES Details Entry
   */
  async countByIndustrySupervisor(
    industrySupervisorId: string,
    siwesSessionId?: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        industrySupervisorId,
        ...(siwesSessionId && { siwesSessionId }),
      },
    });
  }

  /**
   * Count SIWES details by placement organization
   * @feature #12 Student SIWES Details Entry
   */
  async countByOrganization(
    placementOrganizationId: string,
    siwesSessionId?: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        placementOrganizationId,
        ...(siwesSessionId && { siwesSessionId }),
      },
    });
  }

  /**
   * Update a SIWES detail
   * @feature #12 Student SIWES Details Entry
   */
  async update(
    id: string,
    data: Prisma.StudentSiwesDetailUpdateInput,
  ): Promise<StudentSiwesDetail> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a SIWES detail
   * @feature #12 Student SIWES Details Entry
   */
  async delete(id: string): Promise<StudentSiwesDetail> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Check if SIWES detail exists for student and session
   * @feature #12 Student SIWES Details Entry
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
}

export const studentSiwesDetailRepository = new StudentSiwesDetailRepository();
