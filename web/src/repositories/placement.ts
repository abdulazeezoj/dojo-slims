import type { PlacementOrganization, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";


/**
 * Placement Organization Repository - Thin data access layer for PlacementOrganization entity
 */
export class PlacementRepository {
  async findById(id: string): Promise<PlacementOrganization | null> {
    return prisma.placementOrganization.findUnique({
      where: { id },
      include: {
        industrySupervisors: true,
      },
    });
  }

  async findByName(name: string): Promise<PlacementOrganization | null> {
    return prisma.placementOrganization.findFirst({
      where: { name },
      include: {
        industrySupervisors: true,
      },
    });
  }

  async create(
    data: Prisma.PlacementOrganizationCreateInput,
  ): Promise<PlacementOrganization> {
    return prisma.placementOrganization.create({
      data,
      include: {
        industrySupervisors: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.PlacementOrganizationUpdateInput,
  ): Promise<PlacementOrganization> {
    return prisma.placementOrganization.update({
      where: { id },
      data,
      include: {
        industrySupervisors: true,
      },
    });
  }

  async delete(id: string): Promise<PlacementOrganization> {
    return prisma.placementOrganization.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.PlacementOrganizationWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PlacementOrganizationOrderByWithRelationInput;
  }): Promise<PlacementOrganization[]> {
    return prisma.placementOrganization.findMany({
      ...params,
      include: {
        industrySupervisors: true,
      },
    });
  }

  async count(where?: Prisma.PlacementOrganizationWhereInput): Promise<number> {
    return prisma.placementOrganization.count({
      where,
    });
  }

  async createMany(
    data: Prisma.PlacementOrganizationCreateManyInput[],
  ): Promise<number> {
    const result = await prisma.placementOrganization.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async searchByName(query: string): Promise<PlacementOrganization[]> {
    return prisma.placementOrganization.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        industrySupervisors: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findByCity(city: string): Promise<PlacementOrganization[]> {
    return prisma.placementOrganization.findMany({
      where: { city },
      include: {
        industrySupervisors: true,
      },
    });
  }

  async findByState(state: string): Promise<PlacementOrganization[]> {
    return prisma.placementOrganization.findMany({
      where: { state },
      include: {
        industrySupervisors: true,
      },
    });
  }

  // Additional methods for organization service
  async findByStudentId(studentId: string): Promise<PlacementOrganization[]> {
    // Note: This assumes there's a relation through SiwesDetail
    const siwesDetails = await prisma.siwesDetail.findMany({
      where: { studentId },
      include: {
        placementOrganization: {
          include: {
            industrySupervisors: true,
          },
        },
      },
    });

    return siwesDetails
      .map((detail) => detail.placementOrganization)
      .filter((org): org is PlacementOrganization => org !== null);
  }

  async findStudentByMatricNo(matricNo: string) {
    return prisma.student.findUnique({
      where: { matricNumber: matricNo },
    });
  }

  async countUniqueOrganizations(): Promise<number> {
    // Count distinct organizations
    const result = await prisma.placementOrganization.aggregate({
      _count: {
        id: true,
      },
    });
    return result._count.id;
  }

  async countStudentsWithPlacement(): Promise<number> {
    // Count students with SIWES details
    return prisma.siwesDetail.count({
      distinct: ["studentId"],
    });
  }
}

export const placementRepository = new PlacementRepository();
