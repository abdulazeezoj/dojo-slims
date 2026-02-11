import type { Prisma, User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

// ===== TYPE DEFINITIONS =====

/**
 * Pagination parameters
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
}

/**
 * User with all profile types included (student, supervisor, admin)
 * Used for authentication and profile loading
 */
export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    studentProfile: {
      include: {
        department: {
          include: {
            faculty: true;
          };
        };
      };
    };
    schoolSupervisorProfile: {
      include: {
        department: {
          include: {
            faculty: true;
          };
        };
      };
    };
    industrySupervisorProfile: {
      include: {
        placementOrganization: true;
      };
    };
    adminProfile: true;
  };
}>;

// ===== REPOSITORY CLASS =====

/**
 * User Repository
 *
 * Provides data access for User entity with:
 * - Full Prisma API via .prisma property
 * - Custom methods for MVP features from Feature List
 *
 * Note: Password changes and email updates are handled through Better Auth API
 */
export class UserRepository {
  readonly prisma = prisma.user;

  // ===== MVP-FOCUSED CUSTOM METHODS =====

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email with all profile relations loaded
   * @feature #1, #2, #3, #4 - Login for all user types
   */
  async findByEmailWithProfile(email: string): Promise<UserWithProfile | null> {
    return this.prisma.findUnique({
      where: { email },
      include: {
        studentProfile: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        schoolSupervisorProfile: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisorProfile: {
          include: {
            placementOrganization: true,
          },
        },
        adminProfile: true,
      },
    });
  }

  /**
   * Find user by username with all profile relations loaded
   * @feature #1, #2, #3, #4 - Login for all user types (alternative credential)
   */
  async findByUsernameWithProfile(
    username: string,
  ): Promise<UserWithProfile | null> {
    return this.prisma.findUnique({
      where: { username },
      include: {
        studentProfile: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        schoolSupervisorProfile: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        industrySupervisorProfile: {
          include: {
            placementOrganization: true,
          },
        },
        adminProfile: true,
      },
    });
  }

  /**
   * Find user by email (without profile relations)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.findUnique({
      where: { email },
    });
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Activate user account
   * @feature #13, #16, #21, #24 - Profile management for all user types
   */
  async activate(id: string): Promise<User> {
    return this.prisma.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate user account
   * @feature #13, #16, #21, #24 - Profile management for all user types
   */
  async deactivate(id: string): Promise<User> {
    return this.prisma.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

// ===== EXPORT SINGLETON =====

export const userRepository = new UserRepository();
