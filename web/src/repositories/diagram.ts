import type { Diagram, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Type Definitions
 */

/**
 * Diagram with weekly entry details
 */
type DiagramWithEntry = Prisma.DiagramGetPayload<{
  include: {
    weeklyEntry: {
      include: {
        student: {
          include: {
            user: true;
          };
        };
        siwesSession: true;
      };
    };
  };
}>;

/**
 * Diagram Repository
 *
 * Handles diagram uploads for weekly entries.
 * MVP Feature: #7 (Upload diagram)
 */
export class DiagramRepository {
  readonly prisma = prisma.diagram;

  // ==================== Custom Methods ====================

  /**
   * Find all diagrams for a weekly entry
   * @feature #7 Upload Diagram
   */
  async findByWeeklyEntry(weeklyEntryId: string): Promise<Diagram[]> {
    return this.prisma.findMany({
      where: { weeklyEntryId },
      orderBy: {
        uploadedAt: "asc",
      },
    });
  }

  /**
   * Find diagram by ID with entry details
   * @feature #7 Upload Diagram
   */
  async findByIdWithEntry(id: string): Promise<DiagramWithEntry | null> {
    return this.prisma.findUnique({
      where: { id },
      include: {
        weeklyEntry: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
      },
    });
  }

  /**
   * Create a diagram
   * @feature #7 Upload Diagram
   */
  async createDiagram(data: Prisma.DiagramCreateInput): Promise<Diagram> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a diagram
   * @feature #7 Upload Diagram
   */
  async update(id: string, data: Prisma.DiagramUpdateInput): Promise<Diagram> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a diagram
   * @feature #7 Upload Diagram
   */
  async deleteDiagram(id: string): Promise<Diagram> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Count diagrams for a weekly entry
   * @feature #7 Upload Diagram
   */
  async countByEntry(weeklyEntryId: string): Promise<number> {
    return this.prisma.count({
      where: { weeklyEntryId },
    });
  }
}

export const diagramRepository = new DiagramRepository();
