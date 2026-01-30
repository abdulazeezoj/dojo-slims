import type { Prisma, Student } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

/**
 * Student Repository - Thin data access layer for Student entity
 */
export class StudentRepository {
  /**
   * Find student by ID
   */
  async findById(id: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Find student by matric number
   */
  async findByMatricNumber(matricNumber: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { matricNumber },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Find student by email
   */
  async findByEmail(email: string): Promise<Student | null> {
    return prisma.student.findFirst({
      where: { email },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Create new student
   */
  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    return prisma.student.create({
      data,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Update student by ID
   */
  async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return prisma.student.update({
      where: { id },
      data,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Delete student by ID
   */
  async delete(id: string): Promise<Student> {
    return prisma.student.delete({
      where: { id },
    });
  }

  /**
   * Find students by department
   */
  async findByDepartment(departmentId: string): Promise<Student[]> {
    return prisma.student.findMany({
      where: { departmentId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Find all students with optional filtering and pagination
   */
  async findMany(params: {
    where?: Prisma.StudentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }): Promise<Student[]> {
    return prisma.student.findMany({
      ...params,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  /**
   * Count students with optional filtering
   */
  async count(where?: Prisma.StudentWhereInput): Promise<number> {
    return prisma.student.count({
      where,
    });
  }

  /**
   * Check if matric number exists
   */
  async existsByMatricNumber(matricNumber: string): Promise<boolean> {
    const count = await prisma.student.count({
      where: { matricNumber },
    });
    return count > 0;
  }

  /**
   * Bulk create students
   */
  async createMany(data: Prisma.StudentCreateManyInput[]): Promise<number> {
    const result = await prisma.student.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Deactivate student
   */
  async deactivate(id: string): Promise<Student> {
    return prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate student
   */
  async activate(id: string): Promise<Student> {
    return prisma.student.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const studentRepository = new StudentRepository();
