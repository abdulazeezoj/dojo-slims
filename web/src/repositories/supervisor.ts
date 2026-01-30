import type {
  IndustrySupervisor,
  Prisma,
  SchoolSupervisor,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * School Supervisor Repository - Thin data access layer for SchoolSupervisor entity
 */
export class SchoolSupervisorRepository {
  async findById(id: string): Promise<SchoolSupervisor | null> {
    return prisma.schoolSupervisor.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async findByStaffId(staffId: string): Promise<SchoolSupervisor | null> {
    return prisma.schoolSupervisor.findUnique({
      where: { staffId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<SchoolSupervisor | null> {
    return prisma.schoolSupervisor.findUnique({
      where: { email },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async create(
    data: Prisma.SchoolSupervisorCreateInput,
  ): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.create({
      data,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.SchoolSupervisorUpdateInput,
  ): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.update({
      where: { id },
      data,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.delete({
      where: { id },
    });
  }

  async findByDepartment(departmentId: string): Promise<SchoolSupervisor[]> {
    return prisma.schoolSupervisor.findMany({
      where: { departmentId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.SchoolSupervisorWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.SchoolSupervisorOrderByWithRelationInput;
  }): Promise<SchoolSupervisor[]> {
    return prisma.schoolSupervisor.findMany({
      ...params,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.SchoolSupervisorWhereInput): Promise<number> {
    return prisma.schoolSupervisor.count({
      where,
    });
  }

  async createMany(
    data: Prisma.SchoolSupervisorCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.schoolSupervisor.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async deactivate(id: string): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

/**
 * Industry Supervisor Repository - Thin data access layer for IndustrySupervisor entity
 */
export class IndustrySupervisorRepository {
  async findById(id: string): Promise<IndustrySupervisor | null> {
    return prisma.industrySupervisor.findUnique({
      where: { id },
      include: {
        placementOrganization: true,
      },
    });
  }

  async findByEmail(email: string): Promise<IndustrySupervisor | null> {
    return prisma.industrySupervisor.findUnique({
      where: { email },
      include: {
        placementOrganization: true,
      },
    });
  }

  async create(
    data: Prisma.IndustrySupervisorCreateInput,
  ): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.create({
      data,
      include: {
        placementOrganization: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.IndustrySupervisorUpdateInput,
  ): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.update({
      where: { id },
      data,
      include: {
        placementOrganization: true,
      },
    });
  }

  async delete(id: string): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.delete({
      where: { id },
    });
  }

  async findByOrganization(
    placementOrganizationId: string,
  ): Promise<IndustrySupervisor[]> {
    return prisma.industrySupervisor.findMany({
      where: { placementOrganizationId },
      include: {
        placementOrganization: true,
      },
    });
  }

  async findMany(params: {
    where?: Prisma.IndustrySupervisorWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.IndustrySupervisorOrderByWithRelationInput;
  }): Promise<IndustrySupervisor[]> {
    return prisma.industrySupervisor.findMany({
      ...params,
      include: {
        placementOrganization: true,
      },
    });
  }

  async count(where?: Prisma.IndustrySupervisorWhereInput): Promise<number> {
    return prisma.industrySupervisor.count({
      where,
    });
  }

  async createMany(
    data: Prisma.IndustrySupervisorCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.industrySupervisor.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async deactivate(id: string): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const schoolSupervisorRepository = new SchoolSupervisorRepository();
export const industrySupervisorRepository = new IndustrySupervisorRepository();
