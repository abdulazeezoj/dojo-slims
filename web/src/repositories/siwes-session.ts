import type { Prisma, SiwesSession } from "@/generated/prisma/client";
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
 * SIWES Session with enrollment and logbook statistics
 */
type SiwesSessionWithStats = Prisma.SiwesSessionGetPayload<{
  include: {
    _count: {
      select: {
        studentSessionEnrollments: true;
        supervisorSessionEnrollments: true;
        studentSiwesDetails: true;
        logbookMetadata: true;
      };
    };
  };
}>;

/**
 * SIWES Session Repository
 *
 * Handles SIWES session management for academic terms/periods.
 * Note: This is different from auth Session - this represents academic SIWES sessions.
 * MVP Features: #5 (Session selection on dashboard), #25 (SIWES session management)
 */
export class SiwesSessionRepository {
  readonly prisma = prisma.siwesSession;

  // ==================== Custom Methods ====================

  /**
   * Get currently active SIWES session (most recent)
   * @feature #5 Session Selection on Dashboard
   */
  async findActiveSession(): Promise<SiwesSessionWithStats | null> {
    return this.prisma.findFirst({
      where: {
        status: "ACTIVE",
      },
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Get all active SIWES sessions
   * @feature #25 SIWES Session Management
   */
  async findAllActive(
    params?: PaginationParams,
  ): Promise<SiwesSessionWithStats[]> {
    return this.prisma.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Get all SIWES sessions for a student (enrolled sessions)
   * @feature #5 Session Selection on Dashboard
   */
  async findAllForStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<SiwesSessionWithStats[]> {
    return this.prisma.findMany({
      where: {
        studentSessionEnrollments: {
          some: {
            studentId,
          },
        },
      },
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Get all SIWES sessions for a school supervisor (enrolled sessions)
   * Note: Only school supervisors are tracked in SupervisorSessionEnrollment
   * @feature #5 Session Selection on Dashboard
   */
  async findAllForSchoolSupervisor(
    schoolSupervisorId: string,
    params?: PaginationParams,
  ): Promise<SiwesSessionWithStats[]> {
    return this.prisma.findMany({
      where: {
        supervisorSessionEnrollments: {
          some: {
            schoolSupervisorId,
          },
        },
      },
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Find SIWES session by ID with statistics
   * @feature #25 SIWES Session Management
   */
  async findByIdWithStats(id: string): Promise<SiwesSessionWithStats | null> {
    return this.prisma.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
    });
  }

  /**
   * Get all SIWES sessions with statistics and pagination
   * @feature #25 SIWES Session Management
   */
  async findAllWithStats(
    params?: PaginationParams,
  ): Promise<SiwesSessionWithStats[]> {
    return this.prisma.findMany({
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Get all closed SIWES sessions
   * @feature #25 SIWES Session Management
   */
  async findAllClosed(
    params?: PaginationParams,
  ): Promise<SiwesSessionWithStats[]> {
    return this.prisma.findMany({
      where: {
        status: "CLOSED",
      },
      include: {
        _count: {
          select: {
            studentSessionEnrollments: true,
            supervisorSessionEnrollments: true,
            studentSiwesDetails: true,
            logbookMetadata: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Close a SIWES session
   * @feature #25 SIWES Session Management
   */
  async closeSession(id: string): Promise<SiwesSession> {
    return this.prisma.update({
      where: { id },
      data: {
        status: "CLOSED",
      },
    });
  }

  /**
   * Reopen a SIWES session
   * @feature #25 SIWES Session Management
   */
  async reopenSession(id: string): Promise<SiwesSession> {
    return this.prisma.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });
  }

  /**
   * Count all SIWES sessions
   * @feature #25 SIWES Session Management
   */
  async countAll(): Promise<number> {
    return this.prisma.count();
  }

  /**
   * Count active SIWES sessions
   * @feature #25 SIWES Session Management
   */
  async countActive(): Promise<number> {
    return this.prisma.count({
      where: {
        status: "ACTIVE",
      },
    });
  }

  /**
   * Create a new SIWES session
   * @feature #25 SIWES Session Management
   */
  async create(data: Prisma.SiwesSessionCreateInput): Promise<SiwesSession> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a SIWES session
   * @feature #25 SIWES Session Management
   */
  async update(
    id: string,
    data: Prisma.SiwesSessionUpdateInput,
  ): Promise<SiwesSession> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a SIWES session
   * @feature #25 SIWES Session Management
   */
  async delete(id: string): Promise<SiwesSession> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Check if session name exists
   * @feature #25 SIWES Session Management
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { name },
    });
    return count > 0;
  }
}

export const siwesSessionRepository = new SiwesSessionRepository();
