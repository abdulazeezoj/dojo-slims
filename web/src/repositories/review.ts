import type { Prisma, ReviewRequest } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";


/**
 * Review Request Repository - Thin data access layer for ReviewRequest entity
 */
export class ReviewRepository {
  async findById(id: string): Promise<ReviewRequest | null> {
    return prisma.reviewRequest.findUnique({
      where: { id },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async findByWeeklyEntry(
    weeklyEntryId: string,
  ): Promise<ReviewRequest | null> {
    return prisma.reviewRequest.findUnique({
      where: { weeklyEntryId },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async findByStudent(studentId: string): Promise<ReviewRequest[]> {
    return prisma.reviewRequest.findMany({
      where: { studentId },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });
  }

  async findByIndustrySupervisor(
    industrySupervisorId: string,
  ): Promise<ReviewRequest[]> {
    return prisma.reviewRequest.findMany({
      where: { industrySupervisorId },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });
  }

  async findByIndustrySupervisorAndStatus(
    industrySupervisorId: string,
    status: "PENDING" | "REVIEWED" | "EXPIRED",
  ): Promise<ReviewRequest[]> {
    return prisma.reviewRequest.findMany({
      where: {
        industrySupervisorId,
        status,
      },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });
  }

  async create(data: Prisma.ReviewRequestCreateInput): Promise<ReviewRequest> {
    return prisma.reviewRequest.create({
      data,
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ReviewRequestUpdateInput,
  ): Promise<ReviewRequest> {
    return prisma.reviewRequest.update({
      where: { id },
      data,
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<ReviewRequest> {
    return prisma.reviewRequest.delete({
      where: { id },
    });
  }

  async markAsReviewed(id: string): Promise<ReviewRequest> {
    return prisma.reviewRequest.update({
      where: { id },
      data: {
        status: "REVIEWED",
        reviewedAt: new Date(),
      },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async markAsExpired(id: string): Promise<ReviewRequest> {
    return prisma.reviewRequest.update({
      where: { id },
      data: {
        status: "EXPIRED",
      },
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async findMany(params?: {
    where?: Prisma.ReviewRequestWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ReviewRequestOrderByWithRelationInput;
  }): Promise<ReviewRequest[]> {
    return prisma.reviewRequest.findMany({
      ...params,
      include: {
        weeklyEntry: {
          include: {
            diagrams: true,
            weeklyComments: true,
          },
        },
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisor: {
          include: {
            placementOrganization: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.ReviewRequestWhereInput): Promise<number> {
    return prisma.reviewRequest.count({
      where,
    });
  }

  async countPendingByIndustrySupervisor(
    industrySupervisorId: string,
  ): Promise<number> {
    return prisma.reviewRequest.count({
      where: {
        industrySupervisorId,
        status: "PENDING",
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();
