import type {
  IndustrySupervisorWeeklyComment,
  Prisma,
  SchoolSupervisorWeeklyComment,
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
 * School Supervisor Weekly Comment with relations
 */
type SchoolSupervisorWeeklyCommentWithRelations =
  Prisma.SchoolSupervisorWeeklyCommentGetPayload<{
    include: {
      weeklyEntry: {
        include: {
          student: {
            include: {
              user: true;
            };
          };
          siwesSession: true;
        };
      };
      schoolSupervisor: {
        include: {
          user: true;
          department: true;
        };
      };
    };
  }>;

/**
 * Industry Supervisor Weekly Comment with relations
 */
type IndustrySupervisorWeeklyCommentWithRelations =
  Prisma.IndustrySupervisorWeeklyCommentGetPayload<{
    include: {
      weeklyEntry: {
        include: {
          student: {
            include: {
              user: true;
            };
          };
          siwesSession: true;
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
 * School Supervisor Weekly Comment Repository
 *
 * Handles comments on weekly entries from school supervisors.
 * MVP Features: #19 (School supervisor weekly comments), #10 (View supervisor comments)
 */
export class SchoolSupervisorWeeklyCommentRepository {
  readonly prisma = prisma.schoolSupervisorWeeklyComment;

  // ==================== Custom Methods ====================

  /**
   * Find all school supervisor comments for a weekly entry
   * @feature #19 School Supervisor Weekly Comments
   * @feature #10 View Supervisor Comments
   */
  async findByWeeklyEntry(
    weeklyEntryId: string,
  ): Promise<SchoolSupervisorWeeklyCommentWithRelations[]> {
    return this.prisma.findMany({
      where: { weeklyEntryId },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        schoolSupervisor: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: {
        commentedAt: "asc",
      },
    });
  }

  /**
   * Find all comments by school supervisor with pagination
   * @feature #19 School Supervisor Weekly Comments
   */
  async findBySchoolSupervisor(
    schoolSupervisorId: string,
    params?: PaginationParams,
  ): Promise<SchoolSupervisorWeeklyCommentWithRelations[]> {
    return this.prisma.findMany({
      where: { schoolSupervisorId },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        schoolSupervisor: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        commentedAt: "desc",
      },
    });
  }

  /**
   * Find all comments for a student with pagination
   * @feature #10 View Supervisor Comments
   */
  async findByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<SchoolSupervisorWeeklyCommentWithRelations[]> {
    return this.prisma.findMany({
      where: {
        weeklyEntry: {
          studentId,
        },
      },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        schoolSupervisor: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        commentedAt: "desc",
      },
    });
  }

  /**
   * Create a school supervisor comment
   * @feature #19 School Supervisor Weekly Comments
   */
  async create(
    data: Prisma.SchoolSupervisorWeeklyCommentCreateInput,
  ): Promise<SchoolSupervisorWeeklyComment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a comment
   * @feature #19 School Supervisor Weekly Comments
   */
  async update(
    id: string,
    data: Prisma.SchoolSupervisorWeeklyCommentUpdateInput,
  ): Promise<SchoolSupervisorWeeklyComment> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a comment
   * @feature #19 School Supervisor Weekly Comments
   */
  async delete(id: string): Promise<SchoolSupervisorWeeklyComment> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Count comments by school supervisor
   * @feature #19 School Supervisor Weekly Comments
   */
  async countBySchoolSupervisor(schoolSupervisorId: string): Promise<number> {
    return this.prisma.count({
      where: { schoolSupervisorId },
    });
  }

  /**
   * Count comments for a weekly entry
   * @feature #10 View Supervisor Comments
   */
  async countByWeeklyEntry(weeklyEntryId: string): Promise<number> {
    return this.prisma.count({
      where: { weeklyEntryId },
    });
  }
}

/**
 * Industry Supervisor Weekly Comment Repository
 *
 * Handles comments on weekly entries from industry supervisors.
 * MVP Features: #15 (Industry supervisor weekly comments), #10 (View supervisor comments)
 */
export class IndustrySupervisorWeeklyCommentRepository {
  readonly prisma = prisma.industrySupervisorWeeklyComment;

  // ==================== Custom Methods ====================

  /**
   * Find all industry supervisor comments for a weekly entry
   * @feature #15 Industry Supervisor Weekly Comments
   * @feature #10 View Supervisor Comments
   */
  async findByWeeklyEntry(
    weeklyEntryId: string,
  ): Promise<IndustrySupervisorWeeklyCommentWithRelations[]> {
    return this.prisma.findMany({
      where: { weeklyEntryId },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        industrySupervisor: {
          include: {
            user: true,
            placementOrganization: true,
          },
        },
      },
      orderBy: {
        commentedAt: "asc",
      },
    });
  }

  /**
   * Find all comments by industry supervisor with pagination
   * @feature #15 Industry Supervisor Weekly Comments
   */
  async findByIndustrySupervisor(
    industrySupervisorId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorWeeklyCommentWithRelations[]> {
    return this.prisma.findMany({
      where: { industrySupervisorId },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
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
        commentedAt: "desc",
      },
    });
  }

  /**
   * Find all comments for a student with pagination
   * @feature #10 View Supervisor Comments
   */
  async findByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorWeeklyCommentWithRelations[]> {
    return this.prisma.findMany({
      where: {
        weeklyEntry: {
          studentId,
        },
      },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
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
        commentedAt: "desc",
      },
    });
  }

  /**
   * Create an industry supervisor comment
   * @feature #15 Industry Supervisor Weekly Comments
   */
  async create(
    data: Prisma.IndustrySupervisorWeeklyCommentCreateInput,
  ): Promise<IndustrySupervisorWeeklyComment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a comment
   * @feature #15 Industry Supervisor Weekly Comments
   */
  async update(
    id: string,
    data: Prisma.IndustrySupervisorWeeklyCommentUpdateInput,
  ): Promise<IndustrySupervisorWeeklyComment> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a comment
   * @feature #15 Industry Supervisor Weekly Comments
   */
  async delete(id: string): Promise<IndustrySupervisorWeeklyComment> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Count comments by industry supervisor
   * @feature #15 Industry Supervisor Weekly Comments
   */
  async countByIndustrySupervisor(
    industrySupervisorId: string,
  ): Promise<number> {
    return this.prisma.count({
      where: { industrySupervisorId },
    });
  }

  /**
   * Count comments for a weekly entry
   * @feature #10 View Supervisor Comments
   */
  async countByWeeklyEntry(weeklyEntryId: string): Promise<number> {
    return this.prisma.count({
      where: { weeklyEntryId },
    });
  }
}

export const schoolSupervisorWeeklyCommentRepository =
  new SchoolSupervisorWeeklyCommentRepository();
export const industrySupervisorWeeklyCommentRepository =
  new IndustrySupervisorWeeklyCommentRepository();
