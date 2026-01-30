import type { Prisma, StudentSiwesDetail } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Student SIWES Detail Repository - Thin data access layer for StudentSiwesDetail entity
 */
export class SiwesDetailRepository {
  async findById(id: string): Promise<StudentSiwesDetail | null> {
    return prisma.studentSiwesDetail.findUnique({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async findByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<StudentSiwesDetail | null> {
    return prisma.studentSiwesDetail.findUnique({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async findByStudent(studentId: string): Promise<StudentSiwesDetail[]> {
    return prisma.studentSiwesDetail.findMany({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async findBySession(siwesSessionId: string): Promise<StudentSiwesDetail[]> {
    return prisma.studentSiwesDetail.findMany({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async findByPlacementOrganization(
    placementOrganizationId: string,
  ): Promise<StudentSiwesDetail[]> {
    return prisma.studentSiwesDetail.findMany({
      where: { placementOrganizationId },
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async findByIndustrySupervisor(
    industrySupervisorId: string,
  ): Promise<StudentSiwesDetail[]> {
    return prisma.studentSiwesDetail.findMany({
      where: { industrySupervisorId },
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async create(
    data: Prisma.StudentSiwesDetailCreateInput,
  ): Promise<StudentSiwesDetail> {
    return prisma.studentSiwesDetail.create({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.StudentSiwesDetailUpdateInput,
  ): Promise<StudentSiwesDetail> {
    return prisma.studentSiwesDetail.update({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async delete(id: string): Promise<StudentSiwesDetail> {
    return prisma.studentSiwesDetail.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.StudentSiwesDetailWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.StudentSiwesDetailOrderByWithRelationInput;
  }): Promise<StudentSiwesDetail[]> {
    return prisma.studentSiwesDetail.findMany({
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
        placementOrganization: true,
        industrySupervisor: true,
      },
    });
  }

  async count(where?: Prisma.StudentSiwesDetailWhereInput): Promise<number> {
    return prisma.studentSiwesDetail.count({
      where,
    });
  }

  async exists(studentId: string, siwesSessionId: string): Promise<boolean> {
    const count = await prisma.studentSiwesDetail.count({
      where: {
        studentId,
        siwesSessionId,
      },
    });
    return count > 0;
  }
}

export const siwesDetailRepository = new SiwesDetailRepository();
