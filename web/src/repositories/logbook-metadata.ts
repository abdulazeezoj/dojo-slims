import type { LogbookMetadata, Prisma } from "@/generated/prisma/client";
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
 * Logbook Metadata with student and session relationships
 */
type LogbookMetadataWithEntries = Prisma.LogbookMetadataGetPayload<{
  include: {
    student: {
      include: {
        user: true;
        department: {
          include: {
            faculty: true;
          };
        };
      };
    };
    siwesSession: true;
  };
}>;

/**
 * Logbook Metadata Repository
 *
 * Handles logbook metadata and overall logbook management for students.
 * MVP Features: #5 (Session selection on dashboard), #11 (PDF generation)
 */
export class LogbookMetadataRepository {
  readonly prisma = prisma.logbookMetadata;

  // ==================== Custom Methods ====================

  /**
   * Find logbook metadata by student and session
   * @feature #5 Session Selection on Dashboard
   * @feature #11 PDF Generation
   */
  async findByStudentAndSession(
    studentId: string,
    siwesSessionId: string,
  ): Promise<LogbookMetadataWithEntries | null> {
    return this.prisma.findUnique({
      where: {
        studentId_siwesSessionId: {
          studentId,
          siwesSessionId,
        },
      },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
    });
  }

  /**
   * Find logbook for PDF generation with all necessary data
   * @feature #11 PDF Generation
   */
  async findForPdfGeneration(
    studentId: string,
    siwesSessionId: string,
  ): Promise<LogbookMetadataWithEntries | null> {
    return this.findByStudentAndSession(studentId, siwesSessionId);
  }

  /**
   * Find all logbooks by student with pagination
   * @feature #5 Session Selection on Dashboard
   */
  async findManyByStudent(
    studentId: string,
    params?: PaginationParams,
  ): Promise<LogbookMetadataWithEntries[]> {
    return this.prisma.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find all logbooks by session with pagination
   * @feature #5 Session Selection on Dashboard
   */
  async findManyBySession(
    siwesSessionId: string,
    params?: PaginationParams,
  ): Promise<LogbookMetadataWithEntries[]> {
    return this.prisma.findMany({
      where: { siwesSessionId },
      include: {
        student: {
          include: {
            user: true,
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        siwesSession: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Create logbook metadata
   * @feature #5 Session Selection on Dashboard
   */
  async create(
    data: Prisma.LogbookMetadataCreateInput,
  ): Promise<LogbookMetadata> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update logbook metadata
   * @feature #11 PDF Generation
   */
  async update(
    id: string,
    data: Prisma.LogbookMetadataUpdateInput,
  ): Promise<LogbookMetadata> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete logbook metadata
   */
  async delete(id: string): Promise<LogbookMetadata> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Check if logbook exists for student and session
   */
  async exists(studentId: string, siwesSessionId: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: {
        studentId,
        siwesSessionId,
      },
    });
    return count > 0;
  }
}

export const logbookMetadataRepository = new LogbookMetadataRepository();
