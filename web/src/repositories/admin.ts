import type { AdminUser, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Admin User Repository - Thin data access layer for AdminUser entity
 */
export class AdminRepository {
  async findById(id: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({
      where: { id },
    });
  }

  async findByAdminId(adminId: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({
      where: { adminId },
    });
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({
      where: { email },
    });
  }

  async findByBetterAuthUserId(
    betterAuthUserId: string,
  ): Promise<AdminUser | null> {
    return prisma.adminUser.findFirst({
      where: { betterAuthUserId },
    });
  }

  // Alias for service compatibility
  async findByUserId(userId: string): Promise<AdminUser | null> {
    return this.findByBetterAuthUserId(userId);
  }

  async create(data: Prisma.AdminUserCreateInput): Promise<AdminUser> {
    return prisma.adminUser.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.AdminUserUpdateInput,
  ): Promise<AdminUser> {
    return prisma.adminUser.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<AdminUser> {
    return prisma.adminUser.delete({
      where: { id },
    });
  }

  async findMany(params: {
    where?: Prisma.AdminUserWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.AdminUserOrderByWithRelationInput;
  }): Promise<AdminUser[]> {
    return prisma.adminUser.findMany(params);
  }

  async count(where?: Prisma.AdminUserWhereInput): Promise<number> {
    return prisma.adminUser.count({
      where,
    });
  }

  async existsByAdminId(adminId: string): Promise<boolean> {
    const count = await prisma.adminUser.count({
      where: { adminId },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.adminUser.count({
      where: { email },
    });
    return count > 0;
  }

  async deactivate(id: string): Promise<AdminUser> {
    return prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string): Promise<AdminUser> {
    return prisma.adminUser.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const adminRepository = new AdminRepository();
