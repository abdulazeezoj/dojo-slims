import type { Prisma, User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * User Repository - Thin data access layer for User entity
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by type and reference ID
   */
  async findByTypeAndReference(
    userType: User["userType"],
    userReferenceId: string,
  ): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        userType_userReferenceId: {
          userType,
          userReferenceId,
        },
      },
    });
  }

  /**
   * Create new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Find all users with optional filtering
   */
  async findMany(where?: Prisma.UserWhereInput): Promise<User[]> {
    return prisma.user.findMany({
      where,
    });
  }

  /**
   * Count users with optional filtering
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({
      where,
    });
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const userRepository = new UserRepository();
