import type { Prisma, SchoolSupervisor } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

// ===== TYPE DEFINITIONS =====

/**
 * Pagination parameters
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
}

/**
 * School Supervisor with department and faculty relations
 */
export type SchoolSupervisorWithDetails = Prisma.SchoolSupervisorGetPayload<{
  include: {
    department: {
      include: {
        faculty: true;
      };
    };
    user: true;
  };
}>;

/**
 * School Supervisor dashboard data with assigned students and session info
 * @feature #18 School Supervisor Dashboard
 */
export type SchoolSupervisorDashboardData = Prisma.SchoolSupervisorGetPayload<{
  include: {
    department: {
      include: {
        faculty: true;
      };
    };
    user: true;
    supervisorSessionEnrollments: {
      include: {
        siwesSession: true;
      };
    };
    studentSupervisorAssignments: {
      include: {
        student: {
          include: {
            department: true;
            user: true;
            studentSiwesDetails: {
              include: {
                placementOrganization: true;
                industrySupervisor: {
                  include: {
                    user: true;
                  };
                };
              };
            };
          };
        };
        siwesSession: true;
      };
    };
  };
}>;

// ===== REPOSITORY CLASS =====

/**
 * School Supervisor Repository
 *
 * Provides data access for SchoolSupervisor entity with:
 * - Full Prisma API via .prisma property
 * - Custom methods for MVP features from Feature List
 */
export class SchoolSupervisorRepository {
  readonly prisma = prisma.schoolSupervisor;

  // ===== MVP-FOCUSED CUSTOM METHODS =====

  /**
   * Find school supervisor by staff ID with details
   * @feature #2 School Supervisor Login with Staff ID
   * @feature #21 School Supervisor Profile Management
   */
  async findByStaffIdWithDetails(
    staffId: string,
  ): Promise<SchoolSupervisorWithDetails | null> {
    return this.prisma.findUnique({
      where: { staffId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Find school supervisor by email with details
   * @feature #2 School Supervisor Login (alternative credential)
   */
  async findByEmailWithDetails(
    email: string,
  ): Promise<SchoolSupervisorWithDetails | null> {
    return this.prisma.findUnique({
      where: { email },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Find school supervisor by user ID with details
   */
  async findByUserId(
    userId: string,
  ): Promise<SchoolSupervisorWithDetails | null> {
    return this.prisma.findUnique({
      where: { userId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Find school supervisor dashboard data with assigned students and sessions
   * @feature #18 School Supervisor Dashboard
   */
  async findDashboardData(
    id: string,
  ): Promise<SchoolSupervisorDashboardData | null> {
    return this.prisma.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
        supervisorSessionEnrollments: {
          include: {
            siwesSession: true,
          },
          orderBy: {
            siwesSession: {
              startDate: "desc",
            },
          },
        },
        studentSupervisorAssignments: {
          include: {
            student: {
              include: {
                department: true,
                user: true,
                studentSiwesDetails: {
                  include: {
                    placementOrganization: true,
                    industrySupervisor: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
            siwesSession: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  /**
   * Update school supervisor's current SIWES session
   * @feature #18 School Supervisor Dashboard with Session Switching
   */
  async updateCurrentSession(
    supervisorId: string,
    sessionId: string | null,
  ): Promise<SchoolSupervisor> {
    return this.prisma.update({
      where: { id: supervisorId },
      data: { currentSiwesSessionId: sessionId },
    });
  }

  /**
   * Update school supervisor profile
   * @feature #21 School Supervisor Profile Management
   * Note: Password changes handled through Better Auth API
   */
  async updateProfile(
    id: string,
    data: Prisma.SchoolSupervisorUpdateInput,
  ): Promise<SchoolSupervisor> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Find many school supervisors by department with pagination
   * @feature #29 School Supervisor Management with Bulk Upload
   */
  async findManyByDepartment(
    departmentId: string,
    pagination?: PaginationParams,
  ): Promise<SchoolSupervisorWithDetails[]> {
    return this.prisma.findMany({
      where: { departmentId },
      skip: pagination?.skip,
      take: pagination?.take ?? 50,
      orderBy: {
        user: {
          name: "asc",
        },
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Search school supervisors by name with optional filters and pagination
   * @feature #29 School Supervisor Management
   */
  async searchByName(
    query: string,
    filters?: {
      departmentId?: string;
    },
    pagination?: PaginationParams,
  ): Promise<SchoolSupervisorWithDetails[]> {
    return this.prisma.findMany({
      where: {
        AND: [
          {
            user: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          filters?.departmentId
            ? {
                departmentId: filters.departmentId,
              }
            : {},
        ],
      },
      skip: pagination?.skip,
      take: pagination?.take ?? 50,
      orderBy: {
        user: {
          name: "asc",
        },
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Count school supervisors by department
   * @feature #29 School Supervisor Management
   */
  async countByDepartment(departmentId: string): Promise<number> {
    return this.prisma.count({
      where: { departmentId },
    });
  }

  /**
   * Bulk create school supervisors
   * @feature #29 School Supervisor Management with Bulk Upload
   */
  async createMany(
    data: Prisma.SchoolSupervisorCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Activate school supervisor account
   */
  async activate(id: string): Promise<SchoolSupervisor> {
    return this.prisma.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate school supervisor account
   */
  async deactivate(id: string): Promise<SchoolSupervisor> {
    return this.prisma.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

// ===== EXPORT SINGLETON =====

export const schoolSupervisorRepository = new SchoolSupervisorRepository();
