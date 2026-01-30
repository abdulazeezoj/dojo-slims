import type {
  Prisma,
  StudentSupervisorAssignment,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Student Supervisor Assignment Repository - Thin data access layer for StudentSupervisorAssignment entity
 */
export class AssignmentRepository {
  async findById(id: string): Promise<StudentSupervisorAssignment | null> {
    return prisma.studentSupervisorAssignment.findUnique({
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async findByStudentSupervisorSession(
    studentId: string,
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<StudentSupervisorAssignment | null> {
    return prisma.studentSupervisorAssignment.findUnique({
      where: {
        studentId_schoolSupervisorId_siwesSessionId: {
          studentId,
          schoolSupervisorId,
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async findByStudentSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<StudentSupervisorAssignment[]> {
    return prisma.studentSupervisorAssignment.findMany({
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async findBySupervisorSession(
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<StudentSupervisorAssignment[]> {
    return prisma.studentSupervisorAssignment.findMany({
      where: {
        schoolSupervisorId,
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async findBySession(
    siwesSessionId: string,
  ): Promise<StudentSupervisorAssignment[]> {
    return prisma.studentSupervisorAssignment.findMany({
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async create(
    data: Prisma.StudentSupervisorAssignmentCreateInput,
  ): Promise<StudentSupervisorAssignment> {
    return prisma.studentSupervisorAssignment.create({
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.StudentSupervisorAssignmentUpdateInput,
  ): Promise<StudentSupervisorAssignment> {
    return prisma.studentSupervisorAssignment.update({
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async delete(id: string): Promise<StudentSupervisorAssignment> {
    return prisma.studentSupervisorAssignment.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.StudentSupervisorAssignmentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.StudentSupervisorAssignmentOrderByWithRelationInput;
  }): Promise<StudentSupervisorAssignment[]> {
    return prisma.studentSupervisorAssignment.findMany({
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
        schoolSupervisor: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
        admin: true,
      },
    });
  }

  async count(
    where?: Prisma.StudentSupervisorAssignmentWhereInput,
  ): Promise<number> {
    return prisma.studentSupervisorAssignment.count({
      where,
    });
  }

  async createMany(
    data: Prisma.StudentSupervisorAssignmentCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.studentSupervisorAssignment.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async exists(
    studentId: string,
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<boolean> {
    const count = await prisma.studentSupervisorAssignment.count({
      where: {
        studentId,
        schoolSupervisorId,
        siwesSessionId,
      },
    });
    return count > 0;
  }

  async getSupervisorWorkload(
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<number> {
    return prisma.studentSupervisorAssignment.count({
      where: {
        schoolSupervisorId,
        siwesSessionId,
      },
    });
  }
}

export const assignmentRepository = new AssignmentRepository();
