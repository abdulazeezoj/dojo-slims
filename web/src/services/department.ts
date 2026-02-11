/**
 * Department Service
 * Handles department management operations
 */

import type { Faculty } from "@/generated/prisma/client";
import {
  departmentRepository,
  facultyRepository,
  schoolSupervisorRepository,
  siwesSessionRepository,
  studentRepository,
} from "@/repositories";

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
    const faculty = await facultyRepository.prisma.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Check if department code already exists in this faculty
    const existing = await departmentRepository.findByCodeWithFaculty(
      facultyId,
      data.code,
    );
    if (existing) {
      throw new Error(
        `Department with code ${data.code} already exists in this faculty`,
      );
    }

    // Create department
    await departmentRepository.create({
      name: data.name,
      code: data.code,
      faculty: {
        connect: { id: facultyId },
      },
    });

    // Return updated faculty with departments
    const updatedFaculty = await facultyRepository.findAllWithDepartments();
    return updatedFaculty.find((f) => f.id === facultyId) as Faculty;
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
    const department = await departmentRepository.prisma.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new Error("Department not found");
    }

    if (department.facultyId !== facultyId) {
      throw new Error("Department does not belong to this faculty");
    }

    // If code is being changed, check for conflicts within the faculty
    if (data.code && data.code !== department.code) {
      const existing = await departmentRepository.findByCodeWithFaculty(
        facultyId,
        data.code,
      );
      if (existing) {
        throw new Error(
          `Department with code ${data.code} already exists in this faculty`,
        );
      }
    }

    // Update department
    await departmentRepository.update(departmentId, data);

    // Return updated faculty with departments
    const updatedFaculty = await facultyRepository.findAllWithDepartments();
    return updatedFaculty.find((f) => f.id === facultyId) as Faculty;
  }

  /**
   * Delete department
   */
  async deleteDepartment(
    facultyId: string,
    departmentId: string,
  ): Promise<Faculty> {
    // Check if department exists and belongs to the faculty
    const department = await departmentRepository.prisma.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new Error("Department not found");
    }

    if (department.facultyId !== facultyId) {
      throw new Error("Department does not belong to this faculty");
    }

    // Check if department has students
    const studentCount = await departmentRepository.countStudents(departmentId);
    if (studentCount > 0) {
      throw new Error("Cannot delete department with enrolled students");
    }

    // Delete department
    await departmentRepository.delete(departmentId);

    // Return updated faculty with departments
    const updatedFaculty = await facultyRepository.findAllWithDepartments();
    return updatedFaculty.find((f) => f.id === facultyId) as Faculty;
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(departmentId: string): Promise<{
    totalStudents: number;
    activeSessions: number;
    totalSupervisors: number;
  }> {
    // Verify department exists
    const department = await departmentRepository.prisma.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new Error("Department not found");
    }

    // Get counts using repository methods
    const [totalStudents, activeSessions, totalSupervisors] = await Promise.all(
      [
        studentRepository.prisma.count({ where: { departmentId } }),
        siwesSessionRepository.countActive(),
        schoolSupervisorRepository.prisma.count({ where: { departmentId } }),
      ],
    );

    return {
      totalStudents,
      activeSessions,
      totalSupervisors,
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
    const faculties = await facultyRepository.findAllWithDepartments();

    // Repository includes departments
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
