import type {
  Diagram,
  Prisma,
  WeeklyComment,
  WeeklyEntry,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Weekly Entry Repository - Thin data access layer for WeeklyEntry entity
 */
export class WeeklyEntryRepository {
  /**
   * Find weekly entry by ID
   */
  async findById(id: string): Promise<WeeklyEntry | null> {
    return prisma.weeklyEntry.findUnique({
      where: { id },
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  /**
   * Find weekly entry by student, session, and week number
   */
  async findByStudentSessionWeek(
    studentId: string,
    siwesSessionId: string,
    weekNumber: number,
  ): Promise<WeeklyEntry | null> {
    return prisma.weeklyEntry.findUnique({
      where: {
        studentId_siwesSessionId_weekNumber: {
          studentId,
          siwesSessionId,
          weekNumber,
        },
      },
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  /**
   * Find all weekly entries for a student in a session
   */
  async findByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<WeeklyEntry[]> {
    return prisma.weeklyEntry.findMany({
      where: {
        studentId,
        siwesSessionId,
      },
      orderBy: {
        weekNumber: "asc",
      },
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  /**
   * Create new weekly entry
   */
  async create(data: Prisma.WeeklyEntryCreateInput): Promise<WeeklyEntry> {
    return prisma.weeklyEntry.create({
      data,
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  /**
   * Update weekly entry by ID
   */
  async update(
    id: string,
    data: Prisma.WeeklyEntryUpdateInput,
  ): Promise<WeeklyEntry> {
    return prisma.weeklyEntry.update({
      where: { id },
      data,
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  /**
   * Delete weekly entry by ID
   */
  async delete(id: string): Promise<WeeklyEntry> {
    return prisma.weeklyEntry.delete({
      where: { id },
    });
  }

  /**
   * Lock weekly entry
   */
  async lock(
    id: string,
    lockedBy: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR" | "MANUAL",
  ): Promise<WeeklyEntry> {
    return prisma.weeklyEntry.update({
      where: { id },
      data: {
        isLocked: true,
        lockedBy,
        lockedAt: new Date(),
      },
    });
  }

  /**
   * Unlock weekly entry
   */
  async unlock(id: string): Promise<WeeklyEntry> {
    return prisma.weeklyEntry.update({
      where: { id },
      data: {
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
      },
    });
  }

  /**
   * Find all weekly entries with optional filtering and pagination
   */
  async findMany(params: {
    where?: Prisma.WeeklyEntryWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.WeeklyEntryOrderByWithRelationInput;
  }): Promise<WeeklyEntry[]> {
    return prisma.weeklyEntry.findMany({
      ...params,
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  /**
   * Count weekly entries with optional filtering
   */
  async count(where?: Prisma.WeeklyEntryWhereInput): Promise<number> {
    return prisma.weeklyEntry.count({
      where,
    });
  }
}

/**
 * Diagram Repository - Thin data access layer for Diagram entity
 */
export class DiagramRepository {
  /**
   * Find diagram by ID
   */
  async findById(id: string): Promise<Diagram | null> {
    return prisma.diagram.findUnique({
      where: { id },
    });
  }

  /**
   * Find diagrams by weekly entry
   */
  async findByWeeklyEntry(weeklyEntryId: string): Promise<Diagram[]> {
    return prisma.diagram.findMany({
      where: { weeklyEntryId },
      orderBy: {
        uploadedAt: "asc",
      },
    });
  }

  /**
   * Create new diagram
   */
  async create(data: Prisma.DiagramCreateInput): Promise<Diagram> {
    return prisma.diagram.create({
      data,
    });
  }

  /**
   * Update diagram by ID
   */
  async update(id: string, data: Prisma.DiagramUpdateInput): Promise<Diagram> {
    return prisma.diagram.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete diagram by ID
   */
  async delete(id: string): Promise<Diagram> {
    return prisma.diagram.delete({
      where: { id },
    });
  }
}

/**
 * Weekly Comment Repository - Thin data access layer for WeeklyComment entity
 */
export class WeeklyCommentRepository {
  /**
   * Find comment by ID
   */
  async findById(id: string): Promise<WeeklyComment | null> {
    return prisma.weeklyComment.findUnique({
      where: { id },
    });
  }

  /**
   * Find comments by weekly entry
   */
  async findByWeeklyEntry(weeklyEntryId: string): Promise<WeeklyComment[]> {
    return prisma.weeklyComment.findMany({
      where: { weeklyEntryId },
      orderBy: {
        commentedAt: "asc",
      },
    });
  }

  /**
   * Create new weekly comment
   */
  async create(data: Prisma.WeeklyCommentCreateInput): Promise<WeeklyComment> {
    return prisma.weeklyComment.create({
      data,
    });
  }

  /**
   * Update weekly comment by ID
   */
  async update(
    id: string,
    data: Prisma.WeeklyCommentUpdateInput,
  ): Promise<WeeklyComment> {
    return prisma.weeklyComment.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete weekly comment by ID
   */
  async delete(id: string): Promise<WeeklyComment> {
    return prisma.weeklyComment.delete({
      where: { id },
    });
  }

  /**
   * Find comments by commenter
   */
  async findByCommenter(
    commenterId: string,
    commenterType: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR",
  ): Promise<WeeklyComment[]> {
    return prisma.weeklyComment.findMany({
      where: {
        commenterId,
        commenterType,
      },
      orderBy: {
        commentedAt: "desc",
      },
    });
  }
}

export const weeklyEntryRepository = new WeeklyEntryRepository();
export const diagramRepository = new DiagramRepository();
export const weeklyCommentRepository = new WeeklyCommentRepository();
