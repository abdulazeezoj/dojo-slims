import type { Prisma, Student } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

// ===== TYPE DEFINITIONS =====

/**
 * Pagination parameters
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
}

/**
 * Student with department and faculty relations
 */
export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: {
    department: {
      include: {
        faculty: true;
      };
    };
    user: true;
  };
}>;

/**
 * Student dashboard data with all session enrollments and related data
 * @feature #5 Student Dashboard with Session Switching & Alerts
 */
export type StudentDashboardData = Prisma.StudentGetPayload<{
  include: {
    department: {
      include: {
        faculty: true;
      };
    };
    user: true;
    currentSiwesSession: true;
    studentSessionEnrollments: {
      include: {
        siwesSession: true;
      };
    };
    studentSiwesDetails: {
      include: {
        placementOrganization: true;
        industrySupervisor: {
          include: {
            user: true;
          };
        };
        siwesSession: true;
      };
    };
    studentSupervisorAssignments: {
      include: {
        schoolSupervisor: {
          include: {
            department: true;
            user: true;
          };
        };
        siwesSession: true;
      };
    };
    logbookMetadata: {
      include: {
        siwesSession: true;
      };
    };
  };
}>;

// ===== REPOSITORY CLASS =====

/**
 * Student Repository
 *
 * Provides data access for Student entity with:
 * - Full Prisma API via .prisma property
 * - Custom methods for MVP features from Feature List
 */
export class StudentRepository {
  readonly prisma = prisma.student;

  // ===== MVP-FOCUSED CUSTOM METHODS =====

  // ===== MVP-FOCUSED CUSTOM METHODS =====

  /**
   * Find student by matric number with details (department, faculty, user)
   * @feature #1 Student Login with Matric Number
   * @feature #13 Student Profile Management
   */
  async findByMatricNumberWithDetails(
    matricNumber: string,
  ): Promise<StudentWithDetails | null> {
    return this.prisma.findUnique({
      where: { matricNumber },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Find student by email with details
   * @feature #1 Student Login (alternative credential)
   */
  async findByEmailWithDetails(
    email: string,
  ): Promise<StudentWithDetails | null> {
    return this.prisma.findFirst({
      where: { email },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Find student by user ID with details
   */
  async findByUserId(userId: string): Promise<StudentWithDetails | null> {
    return this.prisma.findUnique({
      where: { userId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Find student dashboard data with all enrollments and related information
   * @feature #5 Student Dashboard with Session Switching & Alerts
   */
  async findDashboardData(id: string): Promise<StudentDashboardData | null> {
    return this.prisma.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
        currentSiwesSession: true,
        studentSessionEnrollments: {
          include: {
            siwesSession: true,
          },
          orderBy: {
            siwesSession: {
              startDate: "desc",
            },
          },
        },
        studentSiwesDetails: {
          include: {
            placementOrganization: true,
            industrySupervisor: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        studentSupervisorAssignments: {
          include: {
            schoolSupervisor: {
              include: {
                department: true,
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        logbookMetadata: {
          include: {
            siwesSession: true,
          },
        },
      },
    });
  }

  /**
   * Find student dashboard data by user ID (Better Auth user ID)
   * @feature #5 Student Dashboard with Session Switching & Alerts
   */
  async findDashboardDataByUserId(
    userId: string,
  ): Promise<StudentDashboardData | null> {
    return this.prisma.findUnique({
      where: { userId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
        currentSiwesSession: true,
        studentSessionEnrollments: {
          include: {
            siwesSession: true,
          },
          orderBy: {
            siwesSession: {
              startDate: "desc",
            },
          },
        },
        studentSiwesDetails: {
          include: {
            placementOrganization: true,
            industrySupervisor: {
              include: {
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        studentSupervisorAssignments: {
          include: {
            schoolSupervisor: {
              include: {
                department: true,
                user: true,
              },
            },
            siwesSession: true,
          },
        },
        logbookMetadata: {
          include: {
            siwesSession: true,
          },
        },
      },
    });
  }

  /**
   * Update student's current SIWES session
   * @feature #5 Student Dashboard with Session Switching
   */
  async updateCurrentSession(
    studentId: string,
    sessionId: string | null,
  ): Promise<Student> {
    return this.prisma.update({
      where: { id: studentId },
      data: { currentSiwesSessionId: sessionId },
    });
  }

  /**
   * Update student profile
   * @feature #12 Student SIWES Details Entry
   * @feature #13 Student Profile Management
   */
  async updateProfile(
    id: string,
    data: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    return this.prisma.update({
      where: { id },
      data,
    });
  }

  /**
   * Find many students by department with pagination
   * @feature #28 Student Management with Bulk Upload
   */
  async findManyByDepartment(
    departmentId: string,
    pagination?: PaginationParams,
  ): Promise<StudentWithDetails[]> {
    return this.prisma.findMany({
      where: { departmentId },
      skip: pagination?.skip,
      take: pagination?.take ?? 50,
      orderBy: {
        user: {
          name: "asc",
        },
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Search students by name with optional filters and pagination
   * @feature #28 Student Management
   */
  async searchByName(
    query: string,
    filters?: {
      departmentId?: string;
    },
    pagination?: PaginationParams,
  ): Promise<StudentWithDetails[]> {
    return this.prisma.findMany({
      where: {
        AND: [
          {
            user: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          filters?.departmentId
            ? {
                departmentId: filters.departmentId,
              }
            : {},
        ],
      },
      skip: pagination?.skip,
      take: pagination?.take ?? 50,
      orderBy: {
        user: {
          name: "asc",
        },
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Count students by department
   * @feature #28 Student Management
   */
  async countByDepartment(departmentId: string): Promise<number> {
    return this.prisma.count({
      where: { departmentId },
    });
  }

  /**
   * Check if student exists by matric number
   */
  async existsByMatricNumber(matricNumber: string): Promise<boolean> {
    const count = await this.prisma.count({
      where: { matricNumber },
    });
    return count > 0;
  }

  /**
   * Bulk create students
   * @feature #28 Student Management with Bulk Upload
   */
  async createMany(data: Prisma.StudentCreateManyInput[]): Promise<number> {
    const result = await this.prisma.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Activate student account
   */
  async activate(id: string): Promise<Student> {
    return this.prisma.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate student account
   */
  async deactivate(id: string): Promise<Student> {
    return this.prisma.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

// ===== EXPORT SINGLETON =====

export const studentRepository = new StudentRepository();
