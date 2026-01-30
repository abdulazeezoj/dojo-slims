import type { Prisma, SiwesSession } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * SIWES Session Repository - Thin data access layer for SiwesSession entity
 */
export class SessionRepository {
  async findById(id: string): Promise<SiwesSession | null> {
    return prisma.siwesSession.findUnique({
      where: { id },
    });
  }

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

  async findByStatus(status: "ACTIVE" | "CLOSED"): Promise<SiwesSession[]> {
    return prisma.siwesSession.findMany({
      where: { status },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  async create(data: Prisma.SiwesSessionCreateInput): Promise<SiwesSession> {
    return prisma.siwesSession.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.SiwesSessionUpdateInput,
  ): Promise<SiwesSession> {
    return prisma.siwesSession.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<SiwesSession> {
    return prisma.siwesSession.delete({
      where: { id },
    });
  }

  async close(id: string): Promise<SiwesSession> {
    return prisma.siwesSession.update({
      where: { id },
      data: {
        status: "CLOSED",
      },
    });
  }

  async reopen(id: string): Promise<SiwesSession> {
    return prisma.siwesSession.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });
  }

  async findMany(params: {
    where?: Prisma.SiwesSessionWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.SiwesSessionOrderByWithRelationInput;
  }): Promise<SiwesSession[]> {
    return prisma.siwesSession.findMany(params);
  }

  async count(where?: Prisma.SiwesSessionWhereInput): Promise<number> {
    return prisma.siwesSession.count({
      where,
    });
  }

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

  async existsByName(name: string): Promise<boolean> {
    const count = await prisma.siwesSession.count({
      where: { name },
    });
    return count > 0;
  }
}

export const sessionRepository = new SessionRepository();
