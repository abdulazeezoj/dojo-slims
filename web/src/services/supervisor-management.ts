/**
 * Supervisor Management Service
 * Handles school supervisor CRUD operations from admin perspective with bulk upload
 * Uses better-auth for authentication
 */

import { Prisma, SchoolSupervisor } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { schoolSupervisorRepository, userRepository } from "@/repositories";
import crypto from "crypto";
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
      schoolSupervisorRepository.findMany({ where, skip, take, orderBy }),
      schoolSupervisorRepository.count(where),
    ]);

    return { supervisors, total };
  }

  /**
   * Get supervisor by ID
   */
  async getSupervisorById(id: string): Promise<SchoolSupervisor | null> {
    return schoolSupervisorRepository.findById(id);
  }

  /**
   * Get supervisor by staff ID
   */
  async getSupervisorByStaffId(
    staffId: string,
  ): Promise<SchoolSupervisor | null> {
    return schoolSupervisorRepository.findByStaffId(staffId);
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
    const existingSupervisor = await schoolSupervisorRepository.findByStaffId(
      data.staffId,
    );
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
    const supervisor = await schoolSupervisorRepository.create({
      name: data.name,
      email: data.email,
      staffId: data.staffId,
      department: { connect: { id: data.departmentId } },
      betterAuthUser: { connect: { id: userId } },
    });

    // Update User with userType and userReferenceId
    await userRepository.update(userId, {
      userType: "SCHOOL_SUPERVISOR",
      userReferenceId: supervisor.id,
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
    const supervisor = await schoolSupervisorRepository.findById(id);
    if (!supervisor) {
      throw new Error("Supervisor not found");
    }

    // Check staff ID uniqueness if being changed
    if (data.staffId && data.staffId !== supervisor.staffId) {
      const existing = await schoolSupervisorRepository.findByStaffId(
        data.staffId,
      );
      if (existing) {
        throw new Error(
          `Supervisor with staff ID ${data.staffId} already exists`,
        );
      }
    }

    // Check email uniqueness if being changed
    if (data.email && data.email !== supervisor.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== supervisor.betterAuthUserId) {
        throw new Error(`User with email ${data.email} already exists`);
      }
    }

    // Update User record if email or name changed
    if (data.email || data.name) {
      await userRepository.update(supervisor.betterAuthUserId, {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
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

    return schoolSupervisorRepository.update(id, updateData);
  }

  /**
   * Delete supervisor
   */
  async deleteSupervisor(id: string): Promise<void> {
    const supervisor = await schoolSupervisorRepository.findById(id);
    if (!supervisor) {
      throw new Error("Supervisor not found");
    }

    // Check if supervisor has active assignments
    const hasAssignments =
      await schoolSupervisorRepository.hasActiveAssignments(id);
    if (hasAssignments) {
      throw new Error(
        "Cannot delete supervisor with active student assignments. Reassign students first.",
      );
    }

    // Delete supervisor (cascade delete configured in schema will handle related records)
    await schoolSupervisorRepository.delete(id);

    // Delete the associated User account
    if (supervisor.betterAuthUserId) {
      await userRepository.delete(supervisor.betterAuthUserId);
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
          const department =
            await schoolSupervisorRepository.findDepartmentByCode(
              supervisorData.departmentCode,
            );
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
            await schoolSupervisorRepository.findByStaffId(
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
          const supervisor = await schoolSupervisorRepository.create({
            name: supervisorData.name,
            email: supervisorData.email,
            staffId: supervisorData.staffId,
            department: { connect: { id: department.id } },
            betterAuthUser: { connect: { id: userId } },
          });

          // Update User with userType and userReferenceId
          await userRepository.update(userId, {
            userType: "SCHOOL_SUPERVISOR",
            userReferenceId: supervisor.id,
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

    // TODO: Queue bulk email sending for credentials
    // await mailer.sendBulkWelcomeEmails(credentials);

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
      schoolSupervisorRepository.count(where),
      schoolSupervisorRepository.countActiveAssignments(where),
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
    // This would require complex joins across repositories
    // Implementation depends on specific repository methods
    return [];
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
      level: number;
    }>
  > {
    // This would require checking students without supervisor assignments
    // Implementation depends on assignment repository methods
    return [];
  }
}

export const supervisorManagementService = new SupervisorManagementService();
