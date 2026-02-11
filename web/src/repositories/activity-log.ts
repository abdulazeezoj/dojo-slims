import type { ActivityLog, Prisma, UserType } from "@/generated/prisma/client";
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
 * Activity Log Repository
 *
 * Handles audit trail and activity logging for all user actions.
 * MVP Feature: #21 (Admin Dashboard Activities)
 */
export class ActivityLogRepository {
  /**
   * Prisma client instance for direct access
   */
  readonly prisma = prisma.activityLog;

  /**
   * Create a new activity log entry
   */
  async create(data: {
    userType: UserType;
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<ActivityLog> {
    return await this.prisma.create({
      data: {
        userType: data.userType,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
      },
    });
  }

  /**
   * Find recent activities with pagination
   */
  async findRecent(params?: PaginationParams): Promise<ActivityLog[]> {
    return await this.prisma.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: params?.skip,
      take: params?.take || 20,
    });
  }

  /**
   * Find activities by user
   */
  async findByUser(
    userType: UserType,
    userId: string,
    params?: PaginationParams,
  ): Promise<ActivityLog[]> {
    return await this.prisma.findMany({
      where: {
        userType,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: params?.skip,
      take: params?.take || 20,
    });
  }

  /**
   * Find activities by entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
    params?: PaginationParams,
  ): Promise<ActivityLog[]> {
    return await this.prisma.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: params?.skip,
      take: params?.take || 20,
    });
  }

  /**
   * Find activities by action type
   */
  async findByAction(
    action: string,
    params?: PaginationParams,
  ): Promise<ActivityLog[]> {
    return await this.prisma.findMany({
      where: {
        action,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: params?.skip,
      take: params?.take || 20,
    });
  }

  /**
   * Get activity count
   */
  async count(filter?: {
    userType?: UserType;
    userId?: string;
    entityType?: string;
    action?: string;
  }): Promise<number> {
    return await this.prisma.count({
      where: filter,
    });
  }

  /**
   * Delete old activity logs (for cleanup)
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
    return result.count;
  }
}

export const activityLogRepository = new ActivityLogRepository();
