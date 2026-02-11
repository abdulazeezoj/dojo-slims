import type { Department, Faculty, Prisma } from "@/generated/prisma/client";
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
 * Faculty with all departments
 */
type FacultyWithDepartments = Prisma.FacultyGetPayload<{
  include: {
    departments: true;
    _count: {
      select: {
        departments: true;
      };
    };
  };
}>;

/**
 * Department with faculty details
 */
type DepartmentWithFaculty = Prisma.DepartmentGetPayload<{
  include: {
    faculty: true;
    _count: {
      select: {
        students: true;
        schoolSupervisors: true;
      };
    };
  };
}>;

/**
 * Faculty Repository
 *
 * Handles faculty organizational structure and department management.
 * MVP Feature: #26 (Faculty and department management)
 */
export class FacultyRepository {
  readonly prisma = prisma.faculty;

  // ==================== Custom Methods ====================

  /**
   * Find faculty by code with all departments
   * @feature #26 Faculty and Department Management
   */
  async findByCodeWithDepartments(
    code: string,
  ): Promise<FacultyWithDepartments | null> {
    return this.prisma.findUnique({
      where: { code },
      include: {
        departments: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            departments: true,
          },
        },
      },
    });
  }

  /**
   * Find faculty by name with all departments
   * @feature #26 Faculty and Department Management
   */
  async findByNameWithDepartments(
    name: string,
  ): Promise<FacultyWithDepartments | null> {
    return this.prisma.findUnique({
      where: { name },
      include: {
        departments: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            departments: true,
          },
        },
      },
    });
  }

  /**
   * Get all faculties with departments and pagination
   * @feature #26 Faculty and Department Management
   */
  async findAllWithDepartments(
    params?: PaginationParams,
  ): Promise<FacultyWithDepartments[]> {
    return this.prisma.findMany({
      include: {
        departments: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            departments: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Count departments in a faculty
   * @feature #26 Faculty and Department Management
   */
  async countDepartments(facultyId: string): Promise<number> {
    return prisma.department.count({
      where: { facultyId },
    });
  }

  /**
   * Count all faculties
   * @feature #26 Faculty and Department Management
   */
  async countAll(): Promise<number> {
    return this.prisma.count();
  }

  /**
   * Create a new faculty
   * @feature #26 Faculty and Department Management
   */
  async create(data: Prisma.FacultyCreateInput): Promise<Faculty> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Update a faculty
   * @feature #26 Faculty and Department Management
   */
  async update(id: string, data: Prisma.FacultyUpdateInput): Promise<Faculty> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a faculty
   * @feature #26 Faculty and Department Management
   */
  async delete(id: string): Promise<Faculty> {
    return this.prisma.delete({
      where: { id },
    });
  }

  /**
   * Check if faculty code exists
   * @feature #26 Faculty and Department Management
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { code },
    });
    return count > 0;
  }

  /**
   * Check if faculty name exists
   * @feature #26 Faculty and Department Management
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { name },
    });
    return count > 0;
  }
}

/**
 * Department Repository
 *
 * Handles academic departments within faculties.
 * MVP Feature: #26 (Faculty and department management)
 */
export class DepartmentRepository {
  readonly prisma = prisma.department;

  // ==================== Custom Methods ====================

  /**
   * Find department by faculty and code with faculty details
   * @feature #26 Faculty and Department Management
   */
  async findByCodeWithFaculty(
    facultyId: string,
    code: string,
  ): Promise<DepartmentWithFaculty | null> {
    return this.prisma.findUnique({
      where: {
        facultyId_code: {
          facultyId,
          code,
        },
      },
      include: {
        faculty: true,
        _count: {
          select: {
            students: true,
            schoolSupervisors: true,
          },
        },
      },
    });
  }

  /**
   * Get all departments in a faculty with pagination
   * @feature #26 Faculty and Department Management
   */
  async findManyByFaculty(
    facultyId: string,
    params?: PaginationParams,
  ): Promise<DepartmentWithFaculty[]> {
    return this.prisma.findMany({
      where: { facultyId },
      include: {
        faculty: true,
        _count: {
          select: {
            students: true,
            schoolSupervisors: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Get all departments with pagination
   * @feature #26 Faculty and Department Management
   */
  async findAll(params?: PaginationParams): Promise<DepartmentWithFaculty[]> {
    return this.prisma.findMany({
      include: {
        faculty: true,
        _count: {
          select: {
            students: true,
            schoolSupervisors: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Search departments by name
   * @feature #26 Faculty and Department Management
   */
  async searchByName(
    query: string,
    params?: PaginationParams,
  ): Promise<DepartmentWithFaculty[]> {
    return this.prisma.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        faculty: true,
        _count: {
          select: {
            students: true,
            schoolSupervisors: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Count departments in a faculty
   * @feature #26 Faculty and Department Management
   */
  async countByFaculty(facultyId: string): Promise<number> {
    return this.prisma.count({
      where: { facultyId },
    });
  }

  /**
   * Count students in a department
   * @feature #26 Faculty and Department Management
   */
  async countStudents(departmentId: string): Promise<number> {
    const department = await this.prisma.findUnique({
      where: { id: departmentId },
      select: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
    return department?._count.students ?? 0;
  }

  /**
   * Count all departments
   * @feature #26 Faculty and Department Management
   */
  async countAll(): Promise<number> {
    return this.prisma.count();
  }

  /**
   * Create a new department
   * @feature #26 Faculty and Department Management
   */
  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return this.prisma.create({
      data,
    });
  }

  /**
   * Bulk create departments
   * @feature #26 Faculty and Department Management
   */
  async createMany(data: Prisma.DepartmentCreateManyInput[]): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Update a department
   * @feature #26 Faculty and Department Management
   */
  async update(
    id: string,
    data: Prisma.DepartmentUpdateInput,
  ): Promise<Department> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a department
   * @feature #26 Faculty and Department Management
   */
  async delete(id: string): Promise<Department> {
    return this.prisma.delete({
      where: { id },
    });
  }
}

export const facultyRepository = new FacultyRepository();
export const departmentRepository = new DepartmentRepository();
