/**
 * Organization Service
 * Handles placement organization CRUD and bulk upload operations
 */

import { PlacementOrganization, Prisma } from "@/generated/prisma/client";
import { placementRepository } from "@/repositories";

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
      placementRepository.findMany({ where, skip, take, orderBy }),
      placementRepository.count(where),
    ]);

    return { organizations, total };
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<PlacementOrganization | null> {
    return placementRepository.findById(id);
  }

  /**
   * Get organizations by student ID
   */
  async getOrganizationsByStudentId(
    studentId: string,
  ): Promise<PlacementOrganization[]> {
    return placementRepository.findByStudentId(studentId);
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
    const existing = await placementRepository.findByName(data.name);
    if (existing) {
      throw new Error("Organization with this name already exists");
    }

    return placementRepository.create(data);
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
    const organization = await placementRepository.findById(id);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check name uniqueness if updating name
    if (data.name && data.name !== organization.name) {
      const existing = await placementRepository.findByName(data.name);
      if (existing) {
        throw new Error("Organization with this name already exists");
      }
    }

    return placementRepository.update(id, data);
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: string): Promise<void> {
    const organization = await placementRepository.findById(id);
    if (!organization) {
      throw new Error("Organization not found");
    }

    await placementRepository.delete(id);
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
        batch.map(async (org, index) => {
          const rowNumber = i + index + 1;
          try {
            // Check if organization already exists
            const existing = await placementRepository.findByName(org.name);
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
            await placementRepository.create({
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
        }),
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
    const [totalOrganizations, uniqueOrgs, studentsWithPlacement] =
      await Promise.all([
        placementRepository.count({}),
        placementRepository.countUniqueOrganizations(),
        placementRepository.countStudentsWithPlacement(),
      ]);

    return {
      totalOrganizations,
      uniqueOrganizations: uniqueOrgs,
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
    const organizations = await placementRepository.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
      },
      take: limit,
    });

    // Return unique organization names
    const uniqueNames = Array.from(
      new Set(organizations.map((org) => org.name)),
    );
    return uniqueNames;
  }
}

export const organizationService = new OrganizationService();
