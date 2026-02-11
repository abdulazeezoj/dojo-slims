import type { Prisma, WeeklyEntry } from "@/generated/prisma/client";
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
 * Weekly Entry with all related data
 */
type WeeklyEntryWithRelations = Prisma.WeeklyEntryGetPayload<{
  include: {
    student: {
      include: {
        user: true;
      };
    };
    siwesSession: true;
    diagrams: true;
    schoolSupervisorWeeklyComments: {
      include: {
        schoolSupervisor: {
          include: {
            user: true;
          };
        };
      };
    };
    industrySupervisorWeeklyComments: {
      include: {
        industrySupervisor: {
          include: {
            user: true;
          };
        };
      };
    };
    industrySupervisorReviewRequest: true;
  };
}>;

/**
 * Weekly Entry Repository
 *
 * Handles weekly logbook entries for students.
 * MVP Features: #6 (Create weekly entry), #9 (Lock entry by IS), #20 (Lock entry by SS)
 */
export class WeeklyEntryRepository {
  readonly prisma = prisma.weeklyEntry;

  // ==================== Custom Methods ====================

  /**
   * Find weekly entry by student, session, and week number
   * @feature #6 Create Weekly Entry
   */
  async findByStudentSessionWeek(
    studentId: string,
    siwesSessionId: string,
    weekNumber: number,
  ): Promise<WeeklyEntryWithRelations | null> {
    return this.prisma.findUnique({
      where: {
        studentId_siwesSessionId_weekNumber: {
          studentId,
          siwesSessionId,
          weekNumber,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        siwesSession: true,
        diagrams: {
          orderBy: {
            uploadedAt: "asc",
          },
        },
        schoolSupervisorWeeklyComments: {
          include: {
            schoolSupervisor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            commentedAt: "asc",
          },
        },
        industrySupervisorWeeklyComments: {
          include: {
            industrySupervisor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            commentedAt: "asc",
          },
        },
        industrySupervisorReviewRequest: true,
      },
    });
  }

  /**
   * Find all weekly entries for a student session with pagination
   * @feature #6 Create Weekly Entry
   */
  async findManyByStudentSession(
    studentId: string,
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<WeeklyEntryWithRelations[]> {
    return this.prisma.findMany({
      where: {
        studentId,
        siwesSessionId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        siwesSession: true,
        diagrams: {
          orderBy: {
            uploadedAt: "asc",
          },
        },
        schoolSupervisorWeeklyComments: {
          include: {
            schoolSupervisor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            commentedAt: "asc",
          },
        },
        industrySupervisorWeeklyComments: {
          include: {
            industrySupervisor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            commentedAt: "asc",
          },
        },
        industrySupervisorReviewRequest: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        weekNumber: "asc",
      },
    });
  }

  /**
   * Create a weekly entry
   * @feature #6 Create Weekly Entry
   */
  async createWeeklyEntry(
    data: Prisma.WeeklyEntryCreateInput,
  ): Promise<WeeklyEntry> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a weekly entry
   * @feature #6 Create Weekly Entry
   */
  async updateEntry(
    id: string,
    data: Prisma.WeeklyEntryUpdateInput,
  ): Promise<WeeklyEntry> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Lock a weekly entry
   * @feature #9 Lock Entry by Industry Supervisor
   * @feature #20 Lock Entry by School Supervisor
   */
  async lockEntry(
    id: string,
    lockedBy: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR" | "MANUAL",
  ): Promise<WeeklyEntry> {
    return this.prisma.update({
      where: { id },
      data: {
        isLocked: true,
        lockedBy,
        lockedAt: new Date(),
      },
    });
  }

  /**
   * Unlock a weekly entry
   * @feature #9 Lock Entry by Industry Supervisor
   * @feature #20 Lock Entry by School Supervisor
   */
  async unlockEntry(id: string): Promise<WeeklyEntry> {
    return this.prisma.update({
      where: { id },
      data: {
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
      },
    });
  }

  /**
   * Find all locked entries for a student session
   * @feature #9 Lock Entry by Industry Supervisor
   * @feature #20 Lock Entry by School Supervisor
   */
  async findLockedEntries(
    studentId: string,
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<WeeklyEntryWithRelations[]> {
    return this.prisma.findMany({
      where: {
        studentId,
        siwesSessionId,
        isLocked: true,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        siwesSession: true,
        diagrams: true,
        schoolSupervisorWeeklyComments: {
          include: {
            schoolSupervisor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            commentedAt: "asc",
          },
        },
        industrySupervisorWeeklyComments: {
          include: {
            industrySupervisor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            commentedAt: "asc",
          },
        },
        industrySupervisorReviewRequest: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        weekNumber: "asc",
      },
    });
  }

  /**
   * Count weekly entries by student session
   * @feature #6 Create Weekly Entry
   */
  async countByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        studentId,
        siwesSessionId,
      },
    });
  }

  /**
   * Count locked entries by student session
   * @feature #9 Lock Entry by Industry Supervisor
   * @feature #20 Lock Entry by School Supervisor
   */
  async countLockedByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<number> {
    return this.prisma.count({
      where: {
        studentId,
        siwesSessionId,
        isLocked: true,
      },
    });
  }

  /**
   * Delete a weekly entry
   */
  async delete(id: string): Promise<WeeklyEntry> {
    return this.prisma.delete({
      where: { id },
    });
  }
}

export const weeklyEntryRepository = new WeeklyEntryRepository();
export type { WeeklyEntryWithRelations };
