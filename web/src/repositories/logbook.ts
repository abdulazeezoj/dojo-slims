import type {
  Diagram,
  Prisma,
  WeeklyComment,
  WeeklyEntry,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

// Type for WeeklyEntry with included relations
export type WeeklyEntryWithRelations = Prisma.WeeklyEntryGetPayload<{
  include: {
    diagrams: true;
    weeklyComments: true;
    reviewRequest: true;
  };
}>;

/**
 * Weekly Entry Repository - Thin data access layer for WeeklyEntry entity
 */
export class WeeklyEntryRepository {
  async findById(id: string): Promise<WeeklyEntryWithRelations | null> {
    return prisma.weeklyEntry.findUnique({
      where: { id },
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  async findByStudentSessionWeek(
    studentId: string,
    siwesSessionId: string,
    weekNumber: number,
  ): Promise<WeeklyEntryWithRelations | null> {
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

  async findByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<WeeklyEntryWithRelations[]> {
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

  async create(
    data: Prisma.WeeklyEntryCreateInput,
  ): Promise<WeeklyEntryWithRelations> {
    return prisma.weeklyEntry.create({
      data,
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.WeeklyEntryUpdateInput,
  ): Promise<WeeklyEntryWithRelations> {
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

  async delete(id: string): Promise<WeeklyEntry> {
    return prisma.weeklyEntry.delete({
      where: { id },
    });
  }

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

  async findMany(params: {
    where?: Prisma.WeeklyEntryWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.WeeklyEntryOrderByWithRelationInput;
  }): Promise<WeeklyEntryWithRelations[]> {
    return prisma.weeklyEntry.findMany({
      ...params,
      include: {
        diagrams: true,
        weeklyComments: true,
        reviewRequest: true,
      },
    });
  }

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
  async findById(id: string): Promise<Diagram | null> {
    return prisma.diagram.findUnique({
      where: { id },
    });
  }

  async findByWeeklyEntry(weeklyEntryId: string): Promise<Diagram[]> {
    return prisma.diagram.findMany({
      where: { weeklyEntryId },
      orderBy: {
        uploadedAt: "asc",
      },
    });
  }

  async create(data: Prisma.DiagramCreateInput): Promise<Diagram> {
    return prisma.diagram.create({
      data,
    });
  }

  async update(id: string, data: Prisma.DiagramUpdateInput): Promise<Diagram> {
    return prisma.diagram.update({
      where: { id },
      data,
    });
  }

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
  async findById(id: string): Promise<WeeklyComment | null> {
    return prisma.weeklyComment.findUnique({
      where: { id },
    });
  }

  async findByWeeklyEntry(weeklyEntryId: string): Promise<WeeklyComment[]> {
    return prisma.weeklyComment.findMany({
      where: { weeklyEntryId },
      orderBy: {
        commentedAt: "asc",
      },
    });
  }

  async create(data: Prisma.WeeklyCommentCreateInput): Promise<WeeklyComment> {
    return prisma.weeklyComment.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.WeeklyCommentUpdateInput,
  ): Promise<WeeklyComment> {
    return prisma.weeklyComment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<WeeklyComment> {
    return prisma.weeklyComment.delete({
      where: { id },
    });
  }

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

  async findByWeek(weeklyEntryId: string): Promise<WeeklyComment[]> {
    return prisma.weeklyComment.findMany({
      where: {
        weeklyEntryId,
      },
      orderBy: {
        commentedAt: "asc",
      },
    });
  }
}

export const weeklyEntryRepository = new WeeklyEntryRepository();
export const diagramRepository = new DiagramRepository();
export const weeklyCommentRepository = new WeeklyCommentRepository();
