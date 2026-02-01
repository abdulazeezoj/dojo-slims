import type {
  Prisma,
  StudentSessionEnrollment,
  SupervisorSessionEnrollment,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

// Type for StudentSessionEnrollment with included relations
type StudentSessionEnrollmentWithRelations =
  Prisma.StudentSessionEnrollmentGetPayload<{
    include: {
      student: {
        include: {
          department: {
            include: {
              faculty: true;
            };
          };
        };
      };
      siwesSession: true;
    };
  }>;

/**
 * Student Session Enrollment Repository - Thin data access layer for StudentSessionEnrollment entity
 */
export class StudentEnrollmentRepository {
  async findById(
    id: string,
  ): Promise<StudentSessionEnrollmentWithRelations | null> {
    return prisma.studentSessionEnrollment.findUnique({
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
  ): Promise<StudentSessionEnrollmentWithRelations | null> {
    return prisma.studentSessionEnrollment.findUnique({
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

  async findByStudent(
    studentId: string,
  ): Promise<StudentSessionEnrollmentWithRelations[]> {
    return prisma.studentSessionEnrollment.findMany({
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
        enrolledAt: "desc",
      },
    });
  }

  async findBySession(
    siwesSessionId: string,
  ): Promise<StudentSessionEnrollmentWithRelations[]> {
    return prisma.studentSessionEnrollment.findMany({
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

  async findActiveBySession(
    siwesSessionId: string,
  ): Promise<StudentSessionEnrollmentWithRelations[]> {
    return prisma.studentSessionEnrollment.findMany({
      where: {
        siwesSessionId,
        isActive: true,
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

  async create(
    data: Prisma.StudentSessionEnrollmentCreateInput,
  ): Promise<StudentSessionEnrollment> {
    return prisma.studentSessionEnrollment.create({
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
    data: Prisma.StudentSessionEnrollmentUpdateInput,
  ): Promise<StudentSessionEnrollment> {
    return prisma.studentSessionEnrollment.update({
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

  async delete(id: string): Promise<StudentSessionEnrollment> {
    return prisma.studentSessionEnrollment.delete({
      where: { id },
    });
  }

  async createMany(
    data: Prisma.StudentSessionEnrollmentCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.studentSessionEnrollment.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async countBySession(siwesSessionId: string): Promise<number> {
    return prisma.studentSessionEnrollment.count({
      where: { siwesSessionId },
    });
  }

  async deactivate(id: string): Promise<StudentSessionEnrollment> {
    return prisma.studentSessionEnrollment.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string): Promise<StudentSessionEnrollment> {
    return prisma.studentSessionEnrollment.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<StudentSessionEnrollmentWithRelations | null> {
    return this.findByStudentSession(studentId, siwesSessionId);
  }

  async findMany(params: {
    where?: Prisma.StudentSessionEnrollmentWhereInput;
    include?: Prisma.StudentSessionEnrollmentInclude;
    orderBy?: Prisma.StudentSessionEnrollmentOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<StudentSessionEnrollment[]> {
    return prisma.studentSessionEnrollment.findMany(params);
  }

  async count(
    where?: Prisma.StudentSessionEnrollmentWhereInput,
  ): Promise<number> {
    return prisma.studentSessionEnrollment.count({ where });
  }

  async createWeekEntry(
    studentId: string,
    sessionId: string,
    weekNumber: number,
  ) {
    // This creates a weekly entry placeholder
    return prisma.weeklyEntry.create({
      data: {
        student: {
          connect: { id: studentId },
        },
        siwesSession: {
          connect: { id: sessionId },
        },
        weekNumber,
        isLocked: false,
      },
    });
  }
}

/**
 * Supervisor Session Enrollment Repository - Thin data access layer for SupervisorSessionEnrollment entity
 */
export class SupervisorEnrollmentRepository {
  async findById(id: string): Promise<SupervisorSessionEnrollment | null> {
    return prisma.supervisorSessionEnrollment.findUnique({
      where: { id },
      include: {
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
      },
    });
  }

  async findBySupervisorSession(
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<SupervisorSessionEnrollment | null> {
    return prisma.supervisorSessionEnrollment.findUnique({
      where: {
        schoolSupervisorId_siwesSessionId: {
          schoolSupervisorId,
          siwesSessionId,
        },
      },
      include: {
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
      },
    });
  }

  async findBySupervisor(
    schoolSupervisorId: string,
  ): Promise<SupervisorSessionEnrollment[]> {
    return prisma.supervisorSessionEnrollment.findMany({
      where: { schoolSupervisorId },
      include: {
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
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  async findBySession(
    siwesSessionId: string,
  ): Promise<SupervisorSessionEnrollment[]> {
    return prisma.supervisorSessionEnrollment.findMany({
      where: { siwesSessionId },
      include: {
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
      },
    });
  }

  async create(
    data: Prisma.SupervisorSessionEnrollmentCreateInput,
  ): Promise<SupervisorSessionEnrollment> {
    return prisma.supervisorSessionEnrollment.create({
      data,
      include: {
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
      },
    });
  }

  async update(
    id: string,
    data: Prisma.SupervisorSessionEnrollmentUpdateInput,
  ): Promise<SupervisorSessionEnrollment> {
    return prisma.supervisorSessionEnrollment.update({
      where: { id },
      data,
      include: {
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
      },
    });
  }

  async delete(id: string): Promise<SupervisorSessionEnrollment> {
    return prisma.supervisorSessionEnrollment.delete({
      where: { id },
    });
  }

  async createMany(
    data: Prisma.SupervisorSessionEnrollmentCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.supervisorSessionEnrollment.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async countBySession(siwesSessionId: string): Promise<number> {
    return prisma.supervisorSessionEnrollment.count({
      where: { siwesSessionId },
    });
  }

  async findBySupervisorAndSession(
    schoolSupervisorId: string,
    siwesSessionId: string,
  ): Promise<SupervisorSessionEnrollment | null> {
    return this.findBySupervisorSession(schoolSupervisorId, siwesSessionId);
  }
}

export const studentEnrollmentRepository = new StudentEnrollmentRepository();
export const supervisorEnrollmentRepository =
  new SupervisorEnrollmentRepository();
