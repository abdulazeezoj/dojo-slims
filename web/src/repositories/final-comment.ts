import type { FinalComment, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Final Comment Repository - Thin data access layer for FinalComment entity
 */
export class FinalCommentRepository {
  async findById(id: string): Promise<FinalComment | null> {
    return prisma.finalComment.findUnique({
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

  async findByStudentSessionCommenterType(
    studentId: string,
    siwesSessionId: string,
    commenterType: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR",
  ): Promise<FinalComment | null> {
    return prisma.finalComment.findUnique({
      where: {
        studentId_siwesSessionId_commenterType: {
          studentId,
          siwesSessionId,
          commenterType,
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

  async findByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<FinalComment[]> {
    return prisma.finalComment.findMany({
      where: {
        studentId,
        siwesSessionId,
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

  async findByStudent(studentId: string): Promise<FinalComment[]> {
    return prisma.finalComment.findMany({
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
      orderBy: {
        commentedAt: "desc",
      },
    });
  }

  async findBySession(siwesSessionId: string): Promise<FinalComment[]> {
    return prisma.finalComment.findMany({
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

  async findByCommenter(
    commenterId: string,
    commenterType: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR",
  ): Promise<FinalComment[]> {
    return prisma.finalComment.findMany({
      where: {
        commenterId,
        commenterType,
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
      orderBy: {
        commentedAt: "desc",
      },
    });
  }

  async create(data: Prisma.FinalCommentCreateInput): Promise<FinalComment> {
    return prisma.finalComment.create({
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
    data: Prisma.FinalCommentUpdateInput,
  ): Promise<FinalComment> {
    return prisma.finalComment.update({
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

  async delete(id: string): Promise<FinalComment> {
    return prisma.finalComment.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.FinalCommentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.FinalCommentOrderByWithRelationInput;
  }): Promise<FinalComment[]> {
    return prisma.finalComment.findMany({
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

  async count(where?: Prisma.FinalCommentWhereInput): Promise<number> {
    return prisma.finalComment.count({
      where,
    });
  }

  async exists(
    studentId: string,
    siwesSessionId: string,
    commenterType: "INDUSTRY_SUPERVISOR" | "SCHOOL_SUPERVISOR",
  ): Promise<boolean> {
    const count = await prisma.finalComment.count({
      where: {
        studentId,
        siwesSessionId,
        commenterType,
      },
    });
    return count > 0;
  }
}

export const finalCommentRepository = new FinalCommentRepository();
