import type { Prisma, SiwesSession } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * SIWES Session Repository - Thin data access layer for SiwesSession entity
 */
export class SessionRepository {
  /**
   * Find session by ID
   */
  async findById(id: string): Promise<SiwesSession | null> {
    return prisma.siwesSession.findUnique({
      where: { id },
    });
  }

  /**
   * Find active sessions
   */
  async findActive(): Promise<SiwesSession[]> {
    return prisma.siwesSession.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Find current active session (most recent active)
   */
  async findCurrentActive(): Promise<SiwesSession | null> {
    return prisma.siwesSession.findFirst({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Find sessions by status
   */
  async findByStatus(status: "ACTIVE" | "CLOSED"): Promise<SiwesSession[]> {
    return prisma.siwesSession.findMany({
      where: { status },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Create new session
   */
  async create(data: Prisma.SiwesSessionCreateInput): Promise<SiwesSession> {
    return prisma.siwesSession.create({
      data,
    });
  }

  /**
   * Update session by ID
   */
  async update(
    id: string,
    data: Prisma.SiwesSessionUpdateInput,
  ): Promise<SiwesSession> {
    return prisma.siwesSession.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete session by ID
   */
  async delete(id: string): Promise<SiwesSession> {
    return prisma.siwesSession.delete({
      where: { id },
    });
  }

  /**
   * Close session (set status to CLOSED)
   */
  async close(id: string): Promise<SiwesSession> {
    return prisma.siwesSession.update({
      where: { id },
      data: {
        status: "CLOSED",
      },
    });
  }

  /**
   * Reopen session (set status to ACTIVE)
   */
  async reopen(id: string): Promise<SiwesSession> {
    return prisma.siwesSession.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });
  }

  /**
   * Find all sessions with optional filtering and pagination
   */
  async findMany(params: {
    where?: Prisma.SiwesSessionWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.SiwesSessionOrderByWithRelationInput;
  }): Promise<SiwesSession[]> {
    return prisma.siwesSession.findMany(params);
  }

  /**
   * Count sessions with optional filtering
   */
  async count(where?: Prisma.SiwesSessionWhereInput): Promise<number> {
    return prisma.siwesSession.count({
      where,
    });
  }

  /**
   * Find sessions within date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<SiwesSession[]> {
    return prisma.siwesSession.findMany({
      where: {
        AND: [
          {
            startDate: {
              gte: startDate,
            },
          },
          {
            endDate: {
              lte: endDate,
            },
          },
        ],
      },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Check if session name exists
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await prisma.siwesSession.count({
      where: { name },
    });
    return count > 0;
  }
}

export const sessionRepository = new SessionRepository();
