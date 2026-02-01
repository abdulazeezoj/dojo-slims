import type { Department, Faculty, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";


/**
 * Faculty Repository - Thin data access layer for Faculty entity
 */
export class FacultyRepository {
  async findById(id: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCode(code: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({
      where: { code },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({
      where: { name },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.FacultyCreateInput): Promise<Faculty> {
    return prisma.faculty.create({
      data,
      include: {
        departments: true,
      },
    });
  }

  async update(id: string, data: Prisma.FacultyUpdateInput): Promise<Faculty> {
    return prisma.faculty.update({
      where: { id },
      data,
      include: {
        departments: true,
      },
    });
  }

  async delete(id: string): Promise<Faculty> {
    return prisma.faculty.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.FacultyWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.FacultyOrderByWithRelationInput;
  }): Promise<Faculty[]> {
    return prisma.faculty.findMany({
      ...params,
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }

  async count(where?: Prisma.FacultyWhereInput): Promise<number> {
    return prisma.faculty.count({
      where,
    });
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await prisma.faculty.count({
      where: { code },
    });
    return count > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await prisma.faculty.count({
      where: { name },
    });
    return count > 0;
  }

  // Department management methods
  async addDepartment(
    facultyId: string,
    data: { name: string; code: string },
  ): Promise<Faculty> {
    return prisma.faculty.update({
      where: { id: facultyId },
      data: {
        departments: {
          create: data,
        },
      },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }

  async updateDepartment(
    departmentId: string,
    data: { name?: string; code?: string },
  ): Promise<Faculty> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { facultyId: true },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    await prisma.department.update({
      where: { id: departmentId },
      data,
    });

    return prisma.faculty.findUniqueOrThrow({
      where: { id: department.facultyId },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteDepartment(departmentId: string): Promise<Faculty> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { facultyId: true },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    await prisma.department.delete({
      where: { id: departmentId },
    });

    return prisma.faculty.findUniqueOrThrow({
      where: { id: department.facultyId },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });
  }
}

/**
 * Department Repository - Thin data access layer for Department entity
 */
export class DepartmentRepository {
  async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id },
      include: {
        faculty: true,
      },
    });
  }

  async findByFacultyAndCode(
    facultyId: string,
    code: string,
  ): Promise<Department | null> {
    return prisma.department.findUnique({
      where: {
        facultyId_code: {
          facultyId,
          code,
        },
      },
      include: {
        faculty: true,
      },
    });
  }

  async findByFaculty(facultyId: string): Promise<Department[]> {
    return prisma.department.findMany({
      where: { facultyId },
      include: {
        faculty: true,
      },
    });
  }

  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return prisma.department.create({
      data,
      include: {
        faculty: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.DepartmentUpdateInput,
  ): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data,
      include: {
        faculty: true,
      },
    });
  }

  async delete(id: string): Promise<Department> {
    return prisma.department.delete({
      where: { id },
    });
  }

  async findMany(params?: {
    where?: Prisma.DepartmentWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.DepartmentOrderByWithRelationInput;
  }): Promise<Department[]> {
    return prisma.department.findMany({
      ...params,
      include: {
        faculty: true,
      },
    });
  }

  async count(where?: Prisma.DepartmentWhereInput): Promise<number> {
    return prisma.department.count({
      where,
    });
  }

  async createMany(data: Prisma.DepartmentCreateManyInput[]): Promise<number> {
    const result = await prisma.department.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }
}

export const facultyRepository = new FacultyRepository();
export const departmentRepository = new DepartmentRepository();
