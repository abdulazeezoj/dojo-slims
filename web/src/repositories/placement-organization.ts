import type { PlacementOrganization, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Type Definitions
 */

/**
 * Interface for pagination parameters
 */
interface PaginationParams {
  skip?: number;
  take?: number;
}

/**
 * Placement Organization with statistics
 */
type PlacementOrganizationWithStats = Prisma.PlacementOrganizationGetPayload<{
  include: {
    industrySupervisors: {
      select: {
        id: true;
        user: {
          select: {
            name: true;
            email: true;
          };
        };
      };
    };
    _count: {
      select: {
        industrySupervisors: true;
        studentSiwesDetails: true;
      };
    };
  };
}>;

/**
 * Placement Organization Repository
 *
 * Handles placement organizations where students perform their SIWES.
 * MVP Feature: #27 (Placement organization management)
 */
export class PlacementOrganizationRepository {
  readonly prisma = prisma.placementOrganization;

  // ==================== Custom Methods ====================

  /**
   * Find placement organization by name with statistics
   * @feature #27 Placement Organization Management
   */
  async findByNameWithStats(
    name: string,
  ): Promise<PlacementOrganizationWithStats | null> {
    return this.prisma.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      include: {
        industrySupervisors: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            industrySupervisors: true,
            studentSiwesDetails: true,
          },
        },
      },
    });
  }

  /**
   * Search placement organizations by name with pagination
   * @feature #27 Placement Organization Management
   */
  async searchByName(
    query: string,
    params?: PaginationParams,
  ): Promise<PlacementOrganizationWithStats[]> {
    return this.prisma.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        industrySupervisors: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            industrySupervisors: true,
            studentSiwesDetails: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Get all placement organizations with statistics and pagination
   * @feature #27 Placement Organization Management
   */
  async findAllWithStats(
    params?: PaginationParams,
  ): Promise<PlacementOrganizationWithStats[]> {
    return this.prisma.findMany({
      include: {
        industrySupervisors: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            industrySupervisors: true,
            studentSiwesDetails: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Find placement organizations by location (city)
   * @feature #27 Placement Organization Management
   */
  async findByCity(
    city: string,
    params?: PaginationParams,
  ): Promise<PlacementOrganizationWithStats[]> {
    return this.prisma.findMany({
      where: {
        city: {
          equals: city,
          mode: "insensitive",
        },
      },
      include: {
        industrySupervisors: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            industrySupervisors: true,
            studentSiwesDetails: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Find placement organizations by state
   * @feature #27 Placement Organization Management
   */
  async findByState(
    state: string,
    params?: PaginationParams,
  ): Promise<PlacementOrganizationWithStats[]> {
    return this.prisma.findMany({
      where: {
        state: {
          equals: state,
          mode: "insensitive",
        },
      },
      include: {
        industrySupervisors: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            industrySupervisors: true,
            studentSiwesDetails: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Bulk create placement organizations (for upload/import)
   * @feature #27 Placement Organization Management
   */
  async createMany(
    data: Prisma.PlacementOrganizationCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Count all placement organizations
   * @feature #27 Placement Organization Management
   */
  async countAll(): Promise<number> {
    return this.prisma.count();
  }

  /**
   * Count organizations by city
   * @feature #27 Placement Organization Management
   */
  async countByCity(city: string): Promise<number> {
    return this.prisma.count({
      where: {
        city: {
          equals: city,
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Count organizations by state
   * @feature #27 Placement Organization Management
   */
  async countByState(state: string): Promise<number> {
    return this.prisma.count({
      where: {
        state: {
          equals: state,
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Create a new placement organization
   * @feature #27 Placement Organization Management
   */
  async create(
    data: Prisma.PlacementOrganizationCreateInput,
  ): Promise<PlacementOrganization> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a placement organization
   * @feature #27 Placement Organization Management
   */
  async update(
    id: string,
    data: Prisma.PlacementOrganizationUpdateInput,
  ): Promise<PlacementOrganization> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a placement organization
   * @feature #27 Placement Organization Management
   */
  async delete(id: string): Promise<PlacementOrganization> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Check if organization name exists
   * @feature #27 Placement Organization Management
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
    return count > 0;
  }
}

export const placementOrganizationRepository =
  new PlacementOrganizationRepository();
