import type { Prisma, User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * User Repository - Thin data access layer for User entity
 */
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by type and reference ID (composite unique key)
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

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findMany(where?: Prisma.UserWhereInput): Promise<User[]> {
    return prisma.user.findMany({
      where,
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({
      where,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async deactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const userRepository = new UserRepository();
