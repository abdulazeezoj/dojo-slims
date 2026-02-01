/**
 * Department Service
 * Handles department management operations
 */

import type { Faculty } from "@/generated/prisma/client";
import { departmentRepository, facultyRepository } from "@/repositories";

export class DepartmentService {
  /**
   * Add department to faculty
   */
  async addDepartment(
    facultyId: string,
    data: {
      name: string;
      code: string;
    },
  ): Promise<Faculty> {
    const faculty = await facultyRepository.findById(facultyId);
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Check if department code already exists in this faculty
    const existing = await departmentRepository.findByFacultyAndCode(
      facultyId,
      data.code,
    );
    if (existing) {
      throw new Error(
        `Department with code ${data.code} already exists in this faculty`,
      );
    }

    return facultyRepository.addDepartment(facultyId, data);
  }

  /**
   * Update department
   */
  async updateDepartment(
    facultyId: string,
    departmentId: string,
    data: {
      name?: string;
      code?: string;
    },
  ): Promise<Faculty> {
    // Check if department exists and belongs to the faculty
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    if (department.facultyId !== facultyId) {
      throw new Error("Department does not belong to this faculty");
    }

    // If code is being changed, check for conflicts within the faculty
    if (data.code && data.code !== department.code) {
      const existing = await departmentRepository.findByFacultyAndCode(
        facultyId,
        data.code,
      );
      if (existing) {
        throw new Error(
          `Department with code ${data.code} already exists in this faculty`,
        );
      }
    }

    return facultyRepository.updateDepartment(departmentId, data);
  }

  /**
   * Delete department
   */
  async deleteDepartment(
    facultyId: string,
    departmentId: string,
  ): Promise<Faculty> {
    // Check if department exists and belongs to the faculty
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    if (department.facultyId !== facultyId) {
      throw new Error("Department does not belong to this faculty");
    }

    // Check if department has students by re-fetching with student count
    const deptWithCounts = await facultyRepository.findById(facultyId);
    const departments =
      (
        deptWithCounts as {
          departments?: Array<{ id: string; _count?: { students: number } }>;
        }
      )?.departments || [];
    const deptToDelete = departments.find((d) => d.id === departmentId);
    if (deptToDelete?._count?.students && deptToDelete._count.students > 0) {
      throw new Error("Cannot delete department with enrolled students");
    }

    return facultyRepository.deleteDepartment(departmentId);
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(_departmentId: string): Promise<{
    totalStudents: number;
    activeSessions: number;
    totalSupervisors: number;
  }> {
    // This would require additional repository methods
    // For now, return basic structure
    return {
      totalStudents: 0,
      activeSessions: 0,
      totalSupervisors: 0,
    };
  }

  /**
   * Get all departments across all faculties (flat list)
   */
  async getAllDepartments(): Promise<
    Array<{
      id: string;
      name: string;
      code: string;
      facultyId: string;
      facultyName: string;
    }>
  > {
    const faculties = await facultyRepository.findMany({});

    // Repository includes departments, but TypeScript doesn't infer it
    return faculties.flatMap((faculty) => {
      const departments =
        (
          faculty as {
            departments?: Array<{ id: string; name: string; code: string }>;
          }
        ).departments || [];
      return departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        facultyId: faculty.id,
        facultyName: faculty.name,
      }));
    });
  }
}

export const departmentService = new DepartmentService();
