import type { ActivityLog, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Activity Log Repository - Thin data access layer for ActivityLog entity
 */
export class ActivityLogRepository {
  async findById(id: string): Promise<ActivityLog | null> {
    return prisma.activityLog.findUnique({
      where: { id },
    });
  }

  async findByUser(
    userType: "ADMIN" | "STUDENT" | "SCHOOL_SUPERVISOR" | "INDUSTRY_SUPERVISOR",
    userId: string,
  ): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: {
        userType,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findRecent(limit: number = 50): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: Prisma.ActivityLogCreateInput): Promise<ActivityLog> {
    return prisma.activityLog.create({
      data,
    });
  }

  async log(
    userType: "ADMIN" | "STUDENT" | "SCHOOL_SUPERVISOR" | "INDUSTRY_SUPERVISOR",
    userId: string,
    action: string,
    options?: {
      entityType?: string;
      entityId?: string;
      details?: Prisma.InputJsonValue;
      ipAddress?: string;
    },
  ): Promise<ActivityLog> {
    return prisma.activityLog.create({
      data: {
        userType,
        userId,
        action,
        entityType: options?.entityType,
        entityId: options?.entityId,
        details: options?.details,
        ipAddress: options?.ipAddress,
      },
    });
  }

  async findMany(params?: {
    where?: Prisma.ActivityLogWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ActivityLogOrderByWithRelationInput;
  }): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      ...params,
      orderBy: params?.orderBy || {
        createdAt: "desc",
      },
    });
  }

  async count(where?: Prisma.ActivityLogWhereInput): Promise<number> {
    return prisma.activityLog.count({
      where,
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: { action },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await prisma.activityLog.deleteMany({
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
