/**
 * Faculty Service
 * Handles faculty management operations
 */

import { Faculty, Prisma } from "@/generated/prisma/client";
import { facultyRepository } from "@/repositories";

export class FacultyService {
  /**
   * Get all faculties with their departments
   */
  async getAllFaculties(params?: {
    skip?: number;
    take?: number;
    searchTerm?: string;
  }): Promise<{ faculties: Faculty[]; total: number }> {
    const { skip = 0, take = 20, searchTerm } = params || {};

    const where: Prisma.FacultyWhereInput = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { code: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : {};

    const [faculties, total] = await Promise.all([
      facultyRepository.findMany({ where, skip, take }),
      facultyRepository.count(where),
    ]);

    return { faculties, total };
  }

  /**
   * Get faculty by ID with departments
   */
  async getFacultyById(id: string): Promise<Faculty | null> {
    return facultyRepository.findById(id);
  }

  /**
   * Get faculty by code
   */
  async getFacultyByCode(code: string): Promise<Faculty | null> {
    return facultyRepository.findByCode(code);
  }

  /**
   * Create new faculty
   */
  async createFaculty(data: {
    name: string;
    code: string;
    departments: {
      name: string;
      code: string;
    }[];
  }): Promise<Faculty> {
    // Check if faculty code already exists
    const existing = await facultyRepository.findByCode(data.code);
    if (existing) {
      throw new Error(`Faculty with code ${data.code} already exists`);
    }

    return facultyRepository.create({
      name: data.name,
      code: data.code,
      departments: {
        create: data.departments,
      },
    });
  }

  /**
   * Update faculty
   */
  async updateFaculty(
    id: string,
    data: {
      name?: string;
      code?: string;
    },
  ): Promise<Faculty> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // If code is being changed, check for conflicts
    if (data.code && data.code !== faculty.code) {
      const existing = await facultyRepository.findByCode(data.code);
      if (existing) {
        throw new Error(`Faculty with code ${data.code} already exists`);
      }
    }

    return facultyRepository.update(id, data);
  }

  /**
   * Delete faculty
   */
  async deleteFaculty(id: string): Promise<void> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Check if faculty has departments with students
    // Faculty from findById includes departments with _count
    const departments = (faculty as any).departments || [];
    if (departments.length > 0) {
      const hasStudents = departments.some(
        (dept: any) => dept._count?.students && dept._count.students > 0,
      );
      if (hasStudents) {
        throw new Error(
          "Cannot delete faculty with departments that have students",
        );
      }
    }

    await facultyRepository.delete(id);
  }
}

export const facultyService = new FacultyService();
