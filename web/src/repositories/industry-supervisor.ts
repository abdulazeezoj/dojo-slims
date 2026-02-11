import type { IndustrySupervisor, Prisma } from "@/generated/prisma/client";
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
 * Industry Supervisor with placement organization relation
 */
export type IndustrySupervisorWithDetails =
  Prisma.IndustrySupervisorGetPayload<{
    include: {
      placementOrganization: true;
      user: true;
    };
  }>;

/**
 * Industry Supervisor dashboard data with assigned students
 * @feature #14 Industry Supervisor Dashboard
 */
export type IndustrySupervisorDashboardData =
  Prisma.IndustrySupervisorGetPayload<{
    include: {
      placementOrganization: true;
      user: true;
      studentSiwesDetails: {
        include: {
          student: {
            include: {
              department: {
                include: {
                  faculty: true;
                };
              };
            };
          };
        };
      };
    };
  }>;

// ===== REPOSITORY CLASS =====

/**
 * Industry Supervisor Repository
 *
 * Provides data access for IndustrySupervisor entity with:
 * - Full Prisma API via .prisma property
 * - Custom methods for MVP features from Feature List
 */
export class IndustrySupervisorRepository {
  readonly prisma = prisma.industrySupervisor;

  // ===== MVP-FOCUSED CUSTOM METHODS =====

  /**
   * Find industry supervisor by email with details
   * @feature #3 Industry Supervisor Magic Link Login
   * @feature #16 Industry Supervisor Profile Management
   */
  async findByEmailWithDetails(
    email: string,
  ): Promise<IndustrySupervisorWithDetails | null> {
    return this.prisma.findUnique({
      where: { email },
      include: {
        placementOrganization: true,
        user: true,
      },
    });
  }

  /**
   * Find industry supervisor by user ID with details
   */
  async findByUserId(
    userId: string,
  ): Promise<IndustrySupervisorWithDetails | null> {
    return this.prisma.findUnique({
      where: { userId },
      include: {
        placementOrganization: true,
        user: true,
      },
    });
  }

  /**
   * Find industry supervisor dashboard data with assigned students
   * @feature #14 Industry Supervisor Dashboard
   */
  async findDashboardData(
    id: string,
  ): Promise<IndustrySupervisorDashboardData | null> {
    return this.prisma.findUnique({
      where: { id },
      include: {
        placementOrganization: true,
        user: true,
        studentSiwesDetails: {
          include: {
            student: {
              include: {
                department: {
                  include: {
                    faculty: true,
                  },
                },
                user: true,
              },
            },
            // schoolSupervisor: {
            //   include: {
            //     department: true,
            //     user: true,
            //   },
            // },
            siwesSession: true,
          },
        },
      },
    });
  }

  /**
   * Update industry supervisor's current SIWES session
   * @feature #9 Industry Supervisor Dashboard with Session Switching
   */
  async updateCurrentSession(
    supervisorId: string,
    sessionId: string | null,
  ): Promise<IndustrySupervisor> {
    return this.prisma.update({
      where: { id: supervisorId },
      data: { currentSiwesSessionId: sessionId },
    });
  }

  /**
   * Update industry supervisor profile
   * @feature #16 Industry Supervisor Profile Management
   * Note: Email changes should go through Better Auth API for proper account updates
   */
  async updateProfile(
    id: string,
    data: Prisma.IndustrySupervisorUpdateInput,
  ): Promise<IndustrySupervisor> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Find or create industry supervisor by email
   * Created during student SIWES detail entry (#12)
   * @feature #12 Student SIWES Details Entry
   */
  async findOrCreateByEmail(
    email: string,
    data: {
      fullName: string;
      phoneNumber?: string;
      placementOrganizationId: string;
      userId: string;
    },
  ): Promise<IndustrySupervisor> {
    const existing = await this.prisma.findUnique({
      where: { email },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.create({
      data: {
        email,
        name: data.fullName,
        phone: data.phoneNumber,
        placementOrganizationId: data.placementOrganizationId,
        userId: data.userId,
      },
    });
  }

  /**
   * Count industry supervisors by organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.count({
      where: {
        placementOrganizationId: organizationId,
      },
    });
  }

  /**
   * Find industry supervisors by organization with pagination
   */
  async findManyByOrganization(
    organizationId: string,
    pagination?: PaginationParams,
  ): Promise<IndustrySupervisorWithDetails[]> {
    return this.prisma.findMany({
      where: {
        placementOrganizationId: organizationId,
      },
      skip: pagination?.skip,
      take: pagination?.take ?? 50,
      orderBy: {
        name: "asc",
      },
      include: {
        placementOrganization: true,
        user: true,
      },
    });
  }

  /**
   * Activate industry supervisor account
   */
  async activate(id: string): Promise<IndustrySupervisor> {
    return this.prisma.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate industry supervisor account
   */
  async deactivate(id: string): Promise<IndustrySupervisor> {
    return this.prisma.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

// ===== EXPORT SINGLETON =====

export const industrySupervisorRepository = new IndustrySupervisorRepository();
