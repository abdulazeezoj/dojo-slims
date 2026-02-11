/**
 * Organization Service
 * Handles placement organization CRUD and bulk upload operations
 */

import type { PlacementOrganization, Prisma } from "@/generated/prisma/client";
import { placementOrganizationRepository } from "@/repositories";

export class OrganizationService {
  /**
   * Get all organizations with pagination and filtering
   */
  async getAllOrganizations(params?: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    orderBy?: Prisma.PlacementOrganizationOrderByWithRelationInput;
  }): Promise<{ organizations: PlacementOrganization[]; total: number }> {
    const { skip = 0, take = 20, searchTerm, orderBy } = params || {};

    const where: Prisma.PlacementOrganizationWhereInput = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { address: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm, mode: "insensitive" } },
            { city: { contains: searchTerm, mode: "insensitive" } },
            { state: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : {};

    const [organizations, total] = await Promise.all([
      placementOrganizationRepository.prisma.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      placementOrganizationRepository.prisma.count({ where }),
    ]);

    return { organizations, total };
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<PlacementOrganization | null> {
    return placementOrganizationRepository.prisma.findUnique({ where: { id } });
  }

  /**
   * Get organizations by student ID
   */
  async getOrganizationsByStudentId(
    studentId: string,
  ): Promise<PlacementOrganization[]> {
    return placementOrganizationRepository.prisma.findMany({
      where: {
        studentSiwesDetails: {
          some: {
            studentId,
          },
        },
      },
    });
  }

  /**
   * Create new organization
   */
  async createOrganization(data: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
  }): Promise<PlacementOrganization> {
    // Check if organization with same name already exists
    const existing = await placementOrganizationRepository.findByNameWithStats(
      data.name,
    );
    if (existing) {
      throw new Error("Organization with this name already exists");
    }

    return placementOrganizationRepository.create(data);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    id: string,
    data: {
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      email?: string;
    },
  ): Promise<PlacementOrganization> {
    const organization =
      await placementOrganizationRepository.prisma.findUnique({
        where: { id },
      });
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check name uniqueness if updating name
    if (data.name && data.name !== organization.name) {
      const existing =
        await placementOrganizationRepository.findByNameWithStats(data.name);
      if (existing) {
        throw new Error("Organization with this name already exists");
      }
    }

    return placementOrganizationRepository.update(id, data);
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: string): Promise<void> {
    const organization =
      await placementOrganizationRepository.prisma.findUnique({
        where: { id },
      });
    if (!organization) {
      throw new Error("Organization not found");
    }

    await placementOrganizationRepository.delete(id);
  }

  /**
   * Bulk create organizations from CSV data
   */
  async bulkCreateOrganizations(
    organizations: Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      email?: string;
    }>,
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    // Process in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < organizations.length; i += batchSize) {
      const batch = organizations.slice(i, i + batchSize);

      await Promise.all(
        batch.map(
          async (
            org: {
              name: string;
              address?: string;
              city?: string;
              state?: string;
              phone?: string;
              email?: string;
            },
            index,
          ) => {
            const rowNumber = i + index + 1;
            try {
              // Check if organization already exists
              const existing =
                await placementOrganizationRepository.findByNameWithStats(
                  org.name,
                );
              if (existing) {
                errors.push({
                  row: rowNumber,
                  error: `Organization "${org.name}" already exists`,
                });
                failed++;
                return;
              }

              // Validate required fields
              if (!org.name || org.name.trim().length === 0) {
                errors.push({
                  row: rowNumber,
                  error: "Organization name is required",
                });
                failed++;
                return;
              }

              // Create organization
              await placementOrganizationRepository.create({
                name: org.name,
                address: org.address,
                city: org.city,
                state: org.state,
                phone: org.phone,
                email: org.email,
              });

              successful++;
            } catch (error) {
              errors.push({
                row: rowNumber,
                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
              });
              failed++;
            }
          },
        ),
      );
    }

    return { successful, failed, errors };
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(): Promise<{
    totalOrganizations: number;
    uniqueOrganizations: number;
    studentsWithPlacement: number;
  }> {
    const [totalOrganizations, studentsWithPlacement] = await Promise.all([
      placementOrganizationRepository.countAll(),
      placementOrganizationRepository.prisma.count({
        where: {
          studentSiwesDetails: {
            some: {},
          },
        },
      }),
    ]);

    return {
      totalOrganizations,
      uniqueOrganizations: totalOrganizations, // All organizations are unique by definition
      studentsWithPlacement,
    };
  }

  /**
   * Search organizations by name (for autocomplete)
   */
  async searchOrganizationNames(
    searchTerm: string,
    limit: number = 10,
  ): Promise<string[]> {
    const organizations = await placementOrganizationRepository.prisma.findMany(
      {
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        take: limit,
        select: {
          name: true,
        },
      },
    );

    // Return unique organization names
    const uniqueNames = Array.from(
      new Set(organizations.map((org: { name: string }) => org.name)),
    );
    return uniqueNames;
  }
}

export const organizationService = new OrganizationService();
