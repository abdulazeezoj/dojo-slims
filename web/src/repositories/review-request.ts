import type {
  IndustrySupervisorReviewRequest,
  Prisma,
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
 * Industry Supervisor Review Request with full details
 */
type IndustrySupervisorReviewRequestWithRelations =
  Prisma.IndustrySupervisorReviewRequestGetPayload<{
    include: {
      weeklyEntry: {
        include: {
          diagrams: true;
          schoolSupervisorWeeklyComments: true;
          industrySupervisorWeeklyComments: true;
          student: {
            include: {
              user: true;
            };
          };
          siwesSession: true;
        };
      };
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
      industrySupervisor: {
        include: {
          user: true;
          placementOrganization: true;
        };
      };
    };
  }>;

/**
 * Industry Supervisor Review Request Repository
 *
 * Handles review requests from students to industry supervisors.
 * MVP Feature: #8 (Student-triggered review request)
 */
export class IndustrySupervisorReviewRequestRepository {
  readonly prisma = prisma.industrySupervisorReviewRequest;

  // ==================== Custom Methods ====================

  /**
   * Create a review request
   * @feature #8 Student-Triggered Review Request
   */
  async create(
    data: Prisma.IndustrySupervisorReviewRequestCreateInput,
  ): Promise<IndustrySupervisorReviewRequest> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Find review request by weekly entry
   * @feature #8 Student-Triggered Review Request
   */
  async findByWeeklyEntry(
    weeklyEntryId: string,
  ): Promise<IndustrySupervisorReviewRequestWithRelations | null> {
    return this.prisma.findUnique({
      where: { weeklyEntryId },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            schoolSupervisorWeeklyComments: true,
            industrySupervisorWeeklyComments: true,
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
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
   * Find pending review requests for an industry supervisor with pagination
   * @feature #8 Student-Triggered Review Request
   * @feature #14 Industry Supervisor Dashboard
   */
  async findPendingByIndustrySupervisor(
    industrySupervisorId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorReviewRequestWithRelations[]> {
    return this.prisma.findMany({
      where: {
        industrySupervisorId,
        status: "PENDING",
      },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            schoolSupervisorWeeklyComments: true,
            industrySupervisorWeeklyComments: true,
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
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
        requestedAt: "desc",
      },
    });
  }

  /**
   * Find all review requests for an industry supervisor with pagination
   * @feature #8 Student-Triggered Review Request
   * @feature #14 Industry Supervisor Dashboard
   */
  async findByIndustrySupervisor(
    industrySupervisorId: string,
    filters?: {
      status?: "PENDING" | "REVIEWED" | "EXPIRED";
    },
    params?: PaginationParams,
  ): Promise<IndustrySupervisorReviewRequestWithRelations[]> {
    return this.prisma.findMany({
      where: {
        industrySupervisorId,
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            schoolSupervisorWeeklyComments: true,
            industrySupervisorWeeklyComments: true,
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
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
        requestedAt: "desc",
      },
    });
  }

  /**
   * Find all review requests for a student
   * @feature #8 Student-Triggered Review Request
   */
  async findByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorReviewRequestWithRelations[]> {
    return this.prisma.findMany({
      where: { studentId },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            schoolSupervisorWeeklyComments: true,
            industrySupervisorWeeklyComments: true,
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
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
        requestedAt: "desc",
      },
    });
  }

  /**
   * Mark review request as reviewed
   * @feature #8 Student-Triggered Review Request
   * @feature #15 Industry Supervisor Weekly Comments
   */
  async markAsReviewed(id: string): Promise<IndustrySupervisorReviewRequest> {
    return this.prisma.update({
      where: { id },
      data: {
        status: "REVIEWED",
        reviewedAt: new Date(),
      },
    });
  }

  /**
   * Mark review request as expired
   * @feature #8 Student-Triggered Review Request
   */
  async markAsExpired(id: string): Promise<IndustrySupervisorReviewRequest> {
    return this.prisma.update({
      where: { id },
      data: {
        status: "EXPIRED",
      },
    });
  }

  /**
   * Count pending review requests for a supervisor
   * @feature #8 Student-Triggered Review Request
   * @feature #14 Industry Supervisor Dashboard
   */
  async countPendingBySupervisor(
    industrySupervisorId: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        industrySupervisorId,
        status: "PENDING",
      },
    });
  }

  /**
   * Count all review requests by supervisor
   * @feature #14 Industry Supervisor Dashboard
   */
  async countBySupervisor(industrySupervisorId: string): Promise<number> {
    return this.prisma.count({
      where: { industrySupervisorId },
    });
  }

  /**
   * Update a review request
   */
  async update(
    id: string,
    data: Prisma.IndustrySupervisorReviewRequestUpdateInput,
  ): Promise<IndustrySupervisorReviewRequest> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a review request
   */
  async delete(id: string): Promise<IndustrySupervisorReviewRequest> {
    return this.prisma.delete({
      where: { id },
    });
  }
}

export const industrySupervisorReviewRequestRepository =
  new IndustrySupervisorReviewRequestRepository();
