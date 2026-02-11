import type { AdminUser, Prisma } from "@/generated/prisma/client";
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
 * Admin User with full User profile details
 */
type AdminUserWithDetails = Prisma.AdminUserGetPayload<{
  include: {
    user: true;
  };
}>;

/**
 * Admin User Repository
 *
 * Handles admin user profiles and authentication for system administrators.
 * MVP Features: #4 (Admin login with Admin ID), #24 (Admin user management)
 */
export class AdminUserRepository {
  readonly prisma = prisma.adminUser;

  // ==================== Custom Methods ====================

  /**
   * Find admin user by Admin ID with full user details
   * @feature #4 Admin Login with Admin ID
   */
  async findByAdminIdWithDetails(
    adminId: string,
  ): Promise<AdminUserWithDetails | null> {
    return this.prisma.findUnique({
      where: { adminId },
      include: {
        user: true,
      },
    });
  }

  /**
   * Find admin user by email with full user details
   * @feature #4 Admin Login with Admin ID
   */
  async findByEmailWithDetails(
    email: string,
  ): Promise<AdminUserWithDetails | null> {
    return this.prisma.findUnique({
      where: { email },
      include: {
        user: true,
      },
    });
  }

  /**
   * Find admin user by User ID with full details
   * @feature #4 Admin Login with Admin ID
   */
  async findByUserIdWithDetails(
    userId: string,
  ): Promise<AdminUserWithDetails | null> {
    return this.prisma.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  /**
   * Get all active admin users with pagination
   * @feature #24 Admin User Management
   */
  async findAllActive(
    params?: PaginationParams,
  ): Promise<AdminUserWithDetails[]> {
    return this.prisma.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get all admin users (active and inactive) with pagination
   * @feature #24 Admin User Management
   */
  async findAll(params?: PaginationParams): Promise<AdminUserWithDetails[]> {
    return this.prisma.findMany({
      include: {
        user: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Search admin users by name or email
   * @feature #24 Admin User Management
   */
  async searchByNameOrEmail(
    query: string,
    params?: PaginationParams,
  ): Promise<AdminUserWithDetails[]> {
    return this.prisma.findMany({
      where: {
        OR: [
          {
            user: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            adminId: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        user: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update admin user profile
   * @feature #24 Admin User Management
   */
  async updateProfile(
    id: string,
    data: Prisma.AdminUserUpdateInput,
  ): Promise<AdminUser> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Activate an admin user account
   * @feature #24 Admin User Management
   */
  async activate(id: string): Promise<AdminUser> {
    return this.prisma.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate an admin user account
   * @feature #24 Admin User Management
   */
  async deactivate(id: string): Promise<AdminUser> {
    return this.prisma.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Count active admin users
   * @feature #24 Admin User Management
   */
  async countActive(): Promise<number> {
    return this.prisma.count({
      where: {
        isActive: true,
      },
    });
  }

  /**
   * Count all admin users
   * @feature #24 Admin User Management
   */
  async countAll(): Promise<number> {
    return this.prisma.count();
  }

  /**
   * Check if admin ID exists
   * @feature #24 Admin User Management
   */
  async existsByAdminId(adminId: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { adminId },
    });
    return count > 0;
  }

  /**
   * Check if email exists
   * @feature #24 Admin User Management
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Create a new admin user
   * @feature #24 Admin User Management
   */
  async create(data: Prisma.AdminUserCreateInput): Promise<AdminUser> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Delete an admin user
   * @feature #24 Admin User Management
   */
  async delete(id: string): Promise<AdminUser> {
    return this.prisma.delete({
      where: { id },
    });
  }
}

export const adminUserRepository = new AdminUserRepository();
