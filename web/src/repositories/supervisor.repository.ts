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
  /**
   * Find school supervisor by ID
   */
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

  /**
   * Find school supervisor by staff ID
   */
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

  /**
   * Find school supervisor by email
   */
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

  /**
   * Create new school supervisor
   */
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

  /**
   * Update school supervisor by ID
   */
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

  /**
   * Delete school supervisor by ID
   */
  async delete(id: string): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.delete({
      where: { id },
    });
  }

  /**
   * Find school supervisors by department
   */
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

  /**
   * Find all school supervisors with optional filtering and pagination
   */
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

  /**
   * Count school supervisors with optional filtering
   */
  async count(where?: Prisma.SchoolSupervisorWhereInput): Promise<number> {
    return prisma.schoolSupervisor.count({
      where,
    });
  }

  /**
   * Bulk create school supervisors
   */
  async createMany(
    data: Prisma.SchoolSupervisorCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.schoolSupervisor.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Deactivate school supervisor
   */
  async deactivate(id: string): Promise<SchoolSupervisor> {
    return prisma.schoolSupervisor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate school supervisor
   */
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
  /**
   * Find industry supervisor by ID
   */
  async findById(id: string): Promise<IndustrySupervisor | null> {
    return prisma.industrySupervisor.findUnique({
      where: { id },
      include: {
        placementOrganization: true,
      },
    });
  }

  /**
   * Find industry supervisor by email
   */
  async findByEmail(email: string): Promise<IndustrySupervisor | null> {
    return prisma.industrySupervisor.findUnique({
      where: { email },
      include: {
        placementOrganization: true,
      },
    });
  }

  /**
   * Create new industry supervisor
   */
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

  /**
   * Update industry supervisor by ID
   */
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

  /**
   * Delete industry supervisor by ID
   */
  async delete(id: string): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.delete({
      where: { id },
    });
  }

  /**
   * Find industry supervisors by organization
   */
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

  /**
   * Find all industry supervisors with optional filtering and pagination
   */
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

  /**
   * Count industry supervisors with optional filtering
   */
  async count(where?: Prisma.IndustrySupervisorWhereInput): Promise<number> {
    return prisma.industrySupervisor.count({
      where,
    });
  }

  /**
   * Bulk create industry supervisors
   */
  async createMany(
    data: Prisma.IndustrySupervisorCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.industrySupervisor.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Deactivate industry supervisor
   */
  async deactivate(id: string): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate industry supervisor
   */
  async activate(id: string): Promise<IndustrySupervisor> {
    return prisma.industrySupervisor.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const schoolSupervisorRepository = new SchoolSupervisorRepository();
export const industrySupervisorRepository = new IndustrySupervisorRepository();
