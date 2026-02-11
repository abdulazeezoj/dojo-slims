/**
 * Supervisor Management Service
 * Handles school supervisor CRUD operations from admin perspective with bulk upload
 * Uses better-auth for authentication
 */

import crypto from "crypto";

import type { Prisma, SchoolSupervisor } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import {
  departmentRepository,
  schoolSupervisorRepository,
  studentRepository,
  studentSessionEnrollmentRepository,
  studentSupervisorAssignmentRepository,
  userRepository,
} from "@/repositories";

import { notificationService } from "./notifications";

export class SupervisorManagementService {
  /**
   * Get all school supervisors with pagination and filtering
   */
  async getAllSupervisors(params?: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    departmentId?: string;
    orderBy?: Prisma.SchoolSupervisorOrderByWithRelationInput;
  }): Promise<{ supervisors: SchoolSupervisor[]; total: number }> {
    const {
      skip = 0,
      take = 20,
      searchTerm,
      departmentId,
      orderBy,
    } = params || {};

    const where: Prisma.SchoolSupervisorWhereInput = {
      ...(departmentId && { departmentId }),
      ...(searchTerm && {
        OR: [
          { staffId: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    };

    const [supervisors, total] = await Promise.all([
      schoolSupervisorRepository.prisma.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      schoolSupervisorRepository.prisma.count({ where }),
    ]);

    return { supervisors, total };
  }

  /**
   * Get supervisor by ID
   */
  async getSupervisorById(id: string): Promise<SchoolSupervisor | null> {
    return schoolSupervisorRepository.prisma.findUnique({ where: { id } });
  }

  /**
   * Get supervisor by staff ID
   */
  async getSupervisorByStaffId(
    staffId: string,
  ): Promise<SchoolSupervisor | null> {
    return schoolSupervisorRepository.findByStaffIdWithDetails(staffId);
  }

  /**
   * Create new school supervisor with user account
   */
  async createSupervisor(data: {
    name: string;
    email: string;
    staffId: string;
    departmentId: string;
    password?: string;
  }): Promise<SchoolSupervisor> {
    // Check if staff ID already exists
    const existingSupervisor =
      await schoolSupervisorRepository.findByStaffIdWithDetails(data.staffId);
    if (existingSupervisor) {
      throw new Error(
        `Supervisor with staff ID ${data.staffId} already exists`,
      );
    }

    // Check if email already exists in User table
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(`User with email ${data.email} already exists`);
    }

    // Generate random password if not provided
    const password = data.password || crypto.randomBytes(8).toString("hex");

    // Create user via better-auth API
    const userResult = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password,
        name: data.name,
      },
    });

    if (!userResult || !userResult.user) {
      throw new Error("Failed to create user account");
    }

    const userId = userResult.user.id;

    // Create supervisor profile
    const supervisor = await schoolSupervisorRepository.prisma.create({
      data: {
        name: data.name,
        email: data.email,
        staffId: data.staffId,
        department: { connect: { id: data.departmentId } },
        user: { connect: { id: userId } },
      },
    });

    // Update User with userType
    await userRepository.prisma.update({
      where: { id: userId },
      data: { userType: "SCHOOL_SUPERVISOR" },
    });

    // Send welcome email with credentials
    await notificationService.sendWelcomeEmail({
      email: data.email,
      name: data.name,
      userType: "School Supervisor",
      loginCredential: data.staffId,
      temporaryPassword: password,
    });

    return supervisor;
  }

  /**
   * Update supervisor
   */
  async updateSupervisor(
    id: string,
    data: {
      staffId?: string;
      departmentId?: string;
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    },
  ): Promise<SchoolSupervisor> {
    const supervisor = await schoolSupervisorRepository.prisma.findUnique({
      where: { id },
    });
    if (!supervisor) {
      throw new Error("Supervisor not found");
    }

    // Check staff ID uniqueness if being changed
    if (data.staffId && data.staffId !== supervisor.staffId) {
      const existing =
        await schoolSupervisorRepository.findByStaffIdWithDetails(data.staffId);
      if (existing) {
        throw new Error(
          `Supervisor with staff ID ${data.staffId} already exists`,
        );
      }
    }

    // Check email uniqueness if being changed
    if (data.email && data.email !== supervisor.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== supervisor.userId) {
        throw new Error(`User with email ${data.email} already exists`);
      }
    }

    // Update User record if email or name changed
    if (data.email || data.name) {
      await userRepository.prisma.update({
        where: { id: supervisor.userId },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.name && { name: data.name }),
        },
      });
    }

    // Update password via better-auth if provided
    if (data.password) {
      // better-auth doesn't expose a direct password update API
      // This would typically be handled through password reset flow
      throw new Error(
        "Password update not implemented. Use password reset flow.",
      );
    }

    // Update supervisor record
    const updateData: Prisma.SchoolSupervisorUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.staffId && { staffId: data.staffId }),
      ...(data.departmentId && {
        department: { connect: { id: data.departmentId } },
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    return schoolSupervisorRepository.updateProfile(id, updateData);
  }

  /**
   * Delete supervisor
   */
  async deleteSupervisor(id: string): Promise<void> {
    const supervisor = await schoolSupervisorRepository.prisma.findUnique({
      where: { id },
    });
    if (!supervisor) {
      throw new Error("Supervisor not found");
    }

    // Check if supervisor has active assignments
    const assignmentCount =
      await studentSupervisorAssignmentRepository.prisma.count({
        where: { schoolSupervisorId: id },
      });
    if (assignmentCount > 0) {
      throw new Error(
        "Cannot delete supervisor with active student assignments. Reassign students first.",
      );
    }

    // Delete supervisor (cascade delete configured in schema will handle related records)
    await schoolSupervisorRepository.prisma.delete({ where: { id } });

    // Delete the associated User account
    if (supervisor.userId) {
      await userRepository.prisma.delete({ where: { id: supervisor.userId } });
    }
  }

  /**
   * Bulk create supervisors from CSV data
   */
  async bulkCreateSupervisors(
    supervisors: Array<{
      name: string;
      email: string;
      staffId: string;
      departmentCode: string;
    }>,
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    credentials: Array<{ email: string; password: string }>;
  }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];
    const credentials: Array<{ email: string; password: string }> = [];

    // Process in batches (but sequentially to avoid rate limiting)
    const batchSize = 50;
    for (let i = 0; i < supervisors.length; i += batchSize) {
      const batch = supervisors.slice(i, i + batchSize);

      // Process sequentially to avoid overwhelming better-auth
      for (let index = 0; index < batch.length; index++) {
        const supervisorData = batch[index];
        const rowNumber = i + index + 1;
        try {
          // Find department by code
          const department = await departmentRepository.prisma.findFirst({
            where: { code: supervisorData.departmentCode },
          });
          if (!department) {
            errors.push({
              row: rowNumber,
              error: `Department with code ${supervisorData.departmentCode} not found`,
            });
            failed++;
            continue;
          }

          // Check staff ID uniqueness
          const existingSupervisor =
            await schoolSupervisorRepository.findByStaffIdWithDetails(
              supervisorData.staffId,
            );
          if (existingSupervisor) {
            errors.push({
              row: rowNumber,
              error: `Supervisor with staff ID ${supervisorData.staffId} already exists`,
            });
            failed++;
            continue;
          }

          // Check email uniqueness
          const existingUser = await userRepository.findByEmail(
            supervisorData.email,
          );
          if (existingUser) {
            errors.push({
              row: rowNumber,
              error: `User with email ${supervisorData.email} already exists`,
            });
            failed++;
            continue;
          }

          // Generate random password
          const password = crypto.randomBytes(8).toString("hex");

          // Create user via better-auth
          const userResult = await auth.api.signUpEmail({
            body: {
              email: supervisorData.email,
              password,
              name: supervisorData.name,
            },
          });

          if (!userResult || !userResult.user) {
            errors.push({
              row: rowNumber,
              error: "Failed to create user account",
            });
            failed++;
            continue;
          }

          const userId = userResult.user.id;

          // Create supervisor
          const _supervisor = await schoolSupervisorRepository.prisma.create({
            data: {
              name: supervisorData.name,
              email: supervisorData.email,
              staffId: supervisorData.staffId,
              department: { connect: { id: department.id } },
              user: { connect: { id: userId } },
            },
          });

          // Update User with userType
          await userRepository.prisma.update({
            where: { id: userId },
            data: { userType: "SCHOOL_SUPERVISOR" },
          });

          credentials.push({
            email: supervisorData.email,
            password,
          });

          successful++;
        } catch (error) {
          errors.push({
            row: rowNumber,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
          failed++;
        }
      }
    }

    // Send bulk welcome emails for all successfully created supervisors
    if (credentials.length > 0) {
      try {
        const emailData = credentials.map((cred) => {
          // Find corresponding supervisor data for name and staffId
          const supervisorData = supervisors.find((s) => s.email === cred.email);
          return {
            email: cred.email,
            name: supervisorData?.name || "Supervisor",
            userType: "School Supervisor",
            loginCredential: supervisorData?.staffId || cred.email,
            temporaryPassword: cred.password,
          };
        });
        
        await notificationService.sendBulkWelcomeEmails(emailData);
      } catch (error) {
        // Log error but don't fail the bulk creation
        // Users are created successfully, just email sending failed
        console.error("Failed to send bulk welcome emails:", error);
      }
    }

    return { successful, failed, errors, credentials };
  }

  /**
   * Get supervisor statistics
   */
  async getSupervisorStats(params?: { departmentId?: string }): Promise<{
    totalSupervisors: number;
    activeAssignments: number;
    averageWorkload: number;
  }> {
    const where: Prisma.SchoolSupervisorWhereInput = params?.departmentId
      ? { departmentId: params.departmentId }
      : {};

    const [totalSupervisors, activeAssignments] = await Promise.all([
      schoolSupervisorRepository.prisma.count({ where }),
      studentSupervisorAssignmentRepository.prisma.count({ where: {} }),
    ]);

    const averageWorkload =
      totalSupervisors > 0 ? activeAssignments / totalSupervisors : 0;

    return {
      totalSupervisors,
      activeAssignments,
      averageWorkload: Math.round(averageWorkload * 100) / 100,
    };
  }

  /**
   * Get supervisor workload report
   */
  async getSupervisorWorkload(params?: {
    departmentId?: string;
    sessionId?: string;
  }): Promise<
    Array<{
      supervisorId: string;
      supervisorName: string;
      staffId: string;
      assignedStudents: number;
      departmentName: string;
    }>
  > {
    // Build filter for supervisors
    const supervisorFilter: Prisma.SchoolSupervisorWhereInput = {
      isActive: true,
    };

    if (params?.departmentId) {
      supervisorFilter.departmentId = params.departmentId;
    }

    // Get all supervisors matching the filter
    const supervisors = await schoolSupervisorRepository.prisma.findMany({
      where: supervisorFilter,
    });

    // For each supervisor, get their workload
    const workloadReport = await Promise.all(
      supervisors.map(async (supervisor: SchoolSupervisor) => {
        // Get department info
        const department = await departmentRepository.prisma.findUnique({
          where: { id: supervisor.departmentId },
        });

        // Get assignment count for this supervisor
        let assignedStudents = 0;
        if (params?.sessionId) {
          assignedStudents =
            await studentSupervisorAssignmentRepository.prisma.count({
              where: {
                schoolSupervisorId: supervisor.id,
                siwesSessionId: params.sessionId,
              },
            });
        } else {
          // Count all assignments across all sessions
          assignedStudents =
            await studentSupervisorAssignmentRepository.prisma.count({
              where: { schoolSupervisorId: supervisor.id },
            });
        }

        return {
          supervisorId: supervisor.id,
          supervisorName: supervisor.name,
          staffId: supervisor.staffId,
          assignedStudents,
          departmentName: department?.name || "Unknown Department",
        };
      }),
    );

    return workloadReport;
  }

  /**
   * Get unassigned students for a supervisor to review
   */
  async getUnassignedStudents(params?: {
    departmentId?: string;
    sessionId?: string;
  }): Promise<
    Array<{
      studentId: string;
      studentName: string;
      matricNo: string;
    }>
  > {
    if (!params?.sessionId) {
      throw new Error(
        "Session ID is required to check for unassigned students",
      );
    }

    // Get all student enrollments for this session
    const enrollmentFilter: Prisma.StudentSessionEnrollmentWhereInput = {
      siwesSessionId: params.sessionId,
    };

    const enrollments =
      await studentSessionEnrollmentRepository.prisma.findMany({
        where: enrollmentFilter,
      });

    // Get all assignments for this session
    const assignments =
      await studentSupervisorAssignmentRepository.prisma.findMany({
        where: {
          siwesSessionId: params.sessionId,
        },
      });

    // Create a Set of assigned student IDs for fast lookup
    const assignedStudentIds = new Set(
      assignments.map((a: { studentId: string }) => a.studentId),
    );

    // Filter to get unassigned student IDs
    const unassignedStudentIds = enrollments
      .filter(
        (enrollment: { studentId: string }) =>
          !assignedStudentIds.has(enrollment.studentId),
      )
      .map((enrollment: { studentId: string }) => enrollment.studentId);

    // Get student details for unassigned students
    const students = await studentRepository.prisma.findMany({
      where: {
        id: { in: unassignedStudentIds },
        ...(params.departmentId && { departmentId: params.departmentId }),
      },
    });

    // Map to required format
    return students.map(
      (student: { id: string; name: string; matricNumber: string }) => ({
        studentId: student.id,
        studentName: student.name,
        matricNo: student.matricNumber,
      }),
    );
  }
}

export const supervisorManagementService = new SupervisorManagementService();
