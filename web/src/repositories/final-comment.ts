import type {
  IndustrySupervisorFinalComment,
  Prisma,
  SchoolSupervisorFinalComment,
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
 * School Supervisor Final Comment with relations
 */
type SchoolSupervisorFinalCommentWithRelations =
  Prisma.SchoolSupervisorFinalCommentGetPayload<{
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
      schoolSupervisor: {
        include: {
          user: true;
          department: true;
        };
      };
    };
  }>;

/**
 * Industry Supervisor Final Comment with relations
 */
type IndustrySupervisorFinalCommentWithRelations =
  Prisma.IndustrySupervisorFinalCommentGetPayload<{
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
      industrySupervisor: {
        include: {
          user: true;
          placementOrganization: true;
        };
      };
    };
  }>;

/**
 * School Supervisor Final Comment Repository
 *
 * Handles final comments from school supervisors at end of SIWES training.
 * MVP Features: #22 (School supervisor final comment)
 */
export class SchoolSupervisorFinalCommentRepository {
  readonly prisma = prisma.schoolSupervisorFinalComment;

  // ==================== Custom Methods ====================

  /**
   * Find final comment by student and session
   * @feature #22 School Supervisor Final Comment
   */
  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<SchoolSupervisorFinalCommentWithRelations | null> {
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
        siwesSession: true,
        schoolSupervisor: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });
  }

  /**
   * Find all final comments by school supervisor with pagination
   * @feature #22 School Supervisor Final Comment
   */
  async findBySchoolSupervisor(
    schoolSupervisorId: string,
    params?: PaginationParams,
  ): Promise<SchoolSupervisorFinalCommentWithRelations[]> {
    return this.prisma.findMany({
      where: { schoolSupervisorId },
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
   * Find all final comments for a student with pagination
   * @feature #22 School Supervisor Final Comment
   */
  async findByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<SchoolSupervisorFinalCommentWithRelations[]> {
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
   * Find all final comments for a session with pagination
   * @feature #22 School Supervisor Final Comment
   */
  async findBySession(
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<SchoolSupervisorFinalCommentWithRelations[]> {
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
   * Create a school supervisor final comment
   * @feature #22 School Supervisor Final Comment
   */
  async create(
    data: Prisma.SchoolSupervisorFinalCommentCreateInput,
  ): Promise<SchoolSupervisorFinalComment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a final comment
   * @feature #22 School Supervisor Final Comment
   */
  async update(
    id: string,
    data: Prisma.SchoolSupervisorFinalCommentUpdateInput,
  ): Promise<SchoolSupervisorFinalComment> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a final comment
   * @feature #22 School Supervisor Final Comment
   */
  async delete(id: string): Promise<SchoolSupervisorFinalComment> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Count final comments by school supervisor
   * @feature #22 School Supervisor Final Comment
   */
  async countBySchoolSupervisor(schoolSupervisorId: string): Promise<number> {
    return this.prisma.count({
      where: { schoolSupervisorId },
    });
  }

  /**
   * Count final comments for a session
   * @feature #22 School Supervisor Final Comment
   */
  async countBySession(siwesSessionId: string): Promise<number> {
    return this.prisma.count({
      where: { siwesSessionId },
    });
  }
}

/**
 * Industry Supervisor Final Comment Repository
 *
 * Handles final comments from industry supervisors at end of SIWES training.
 * MVP Features: #17 (Industry supervisor final comment)
 */
export class IndustrySupervisorFinalCommentRepository {
  readonly prisma = prisma.industrySupervisorFinalComment;

  // ==================== Custom Methods ====================

  /**
   * Find final comment by student and session
   * @feature #17 Industry Supervisor Final Comment
   */
  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<IndustrySupervisorFinalCommentWithRelations | null> {
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
        siwesSession: true,
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
   * Find all final comments by industry supervisor with pagination
   * @feature #17 Industry Supervisor Final Comment
   */
  async findByIndustrySupervisor(
    industrySupervisorId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorFinalCommentWithRelations[]> {
    return this.prisma.findMany({
      where: { industrySupervisorId },
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
   * Find all final comments for a student with pagination
   * @feature #17 Industry Supervisor Final Comment
   */
  async findByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorFinalCommentWithRelations[]> {
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
   * Find all final comments for a session with pagination
   * @feature #17 Industry Supervisor Final Comment
   */
  async findBySession(
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<IndustrySupervisorFinalCommentWithRelations[]> {
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
   * Create an industry supervisor final comment
   * @feature #17 Industry Supervisor Final Comment
   */
  async create(
    data: Prisma.IndustrySupervisorFinalCommentCreateInput,
  ): Promise<IndustrySupervisorFinalComment> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a final comment
   * @feature #17 Industry Supervisor Final Comment
   */
  async update(
    id: string,
    data: Prisma.IndustrySupervisorFinalCommentUpdateInput,
  ): Promise<IndustrySupervisorFinalComment> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a final comment
   * @feature #17 Industry Supervisor Final Comment
   */
  async delete(id: string): Promise<IndustrySupervisorFinalComment> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Count final comments by industry supervisor
   * @feature #17 Industry Supervisor Final Comment
   */
  async countByIndustrySupervisor(
    industrySupervisorId: string,
  ): Promise<number> {
    return this.prisma.count({
      where: { industrySupervisorId },
    });
  }

  /**
   * Count final comments for a session
   * @feature #17 Industry Supervisor Final Comment
   */
  async countBySession(siwesSessionId: string): Promise<number> {
    return this.prisma.count({
      where: { siwesSessionId },
    });
  }
}

export const schoolSupervisorFinalCommentRepository =
  new SchoolSupervisorFinalCommentRepository();
export const industrySupervisorFinalCommentRepository =
  new IndustrySupervisorFinalCommentRepository();
