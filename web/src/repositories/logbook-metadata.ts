import type { LogbookMetadata, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Logbook Metadata Repository - Thin data access layer for LogbookMetadata entity
 */
export class LogbookMetadataRepository {
  async findById(id: string): Promise<LogbookMetadata | null> {
    return prisma.logbookMetadata.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async findByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<LogbookMetadata | null> {
    return prisma.logbookMetadata.findUnique({
      where: {
        studentId_siwesSessionId: {
          studentId,
          siwesSessionId,
        },
      },
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async findByStudent(studentId: string): Promise<LogbookMetadata[]> {
    return prisma.logbookMetadata.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async findBySession(siwesSessionId: string): Promise<LogbookMetadata[]> {
    return prisma.logbookMetadata.findMany({
      where: { siwesSessionId },
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async create(
    data: Prisma.LogbookMetadataCreateInput,
  ): Promise<LogbookMetadata> {
    return prisma.logbookMetadata.create({
      data,
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.LogbookMetadataUpdateInput,
  ): Promise<LogbookMetadata> {
    return prisma.logbookMetadata.update({
      where: { id },
      data,
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async delete(id: string): Promise<LogbookMetadata> {
    return prisma.logbookMetadata.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.LogbookMetadataWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.LogbookMetadataOrderByWithRelationInput;
  }): Promise<LogbookMetadata[]> {
    return prisma.logbookMetadata.findMany({
      ...params,
      include: {
        student: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  async count(where?: Prisma.LogbookMetadataWhereInput): Promise<number> {
    return prisma.logbookMetadata.count({
      where,
    });
  }

  async exists(studentId: string, siwesSessionId: string): Promise<boolean> {
    const count = await prisma.logbookMetadata.count({
      where: {
        studentId,
        siwesSessionId,
      },
    });
    return count > 0;
  }

  async deleteByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<void> {
    await prisma.logbookMetadata.deleteMany({
      where: {
        studentId,
        siwesSessionId,
      },
    });

    // Also delete all weekly entries for this student/session
    await prisma.weeklyEntry.deleteMany({
      where: {
        studentId,
        siwesSessionId,
      },
    });
  }
}

export const logbookMetadataRepository = new LogbookMetadataRepository();
