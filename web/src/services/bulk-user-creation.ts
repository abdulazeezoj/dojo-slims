/**
 * Bulk User Creation Service
 * Handles bulk creation of users (students, supervisors, admins) via better-auth
 * This service ensures all user creation goes through better-auth, not direct Prisma
 */

import crypto from "crypto";

import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  adminUserRepository,
  schoolSupervisorRepository,
  studentRepository,
  userRepository,
} from "@/repositories";
import { departmentRepository } from "@/repositories/faculty";

import { notificationService } from "./notifications";

const logger = getLogger(["services", "bulk-user-creation"]);

interface BulkCreationResult<T> {
  success: T[];
  failures: Array<{
    data: unknown;
    error: string;
  }>;
}

interface StudentBulkData {
  name: string;
  email: string;
  matricNumber: string;
  departmentId: string;
}

interface SchoolSupervisorBulkData {
  name: string;
  email: string;
  staffId: string;
  departmentId: string;
}

interface AdminUserBulkData {
  name: string;
  email: string;
  adminId: string;
}

export class BulkUserCreationService {
  /**
   * Bulk create students with better-auth
   */
  async bulkCreateStudents(
    students: StudentBulkData[],
  ): Promise<BulkCreationResult<{ matricNumber: string; email: string }>> {
    const result: BulkCreationResult<{
      matricNumber: string;
      email: string;
    }> = {
      success: [],
      failures: [],
    };

    logger.info("Starting bulk student creation", { count: students.length });

    for (const studentData of students) {
      try {
        // Check if matric number already exists
        const existingStudent = await studentRepository.prisma.findUnique({
          where: { matricNumber: studentData.matricNumber },
        });
        if (existingStudent) {
          result.failures.push({
            data: studentData,
            error: `Student with matric number ${studentData.matricNumber} already exists`,
          });
          continue;
        }

        // Check if email already exists
        const existingUser = await userRepository.findByEmail(
          studentData.email,
        );
        if (existingUser) {
          result.failures.push({
            data: studentData,
            error: `User with email ${studentData.email} already exists`,
          });
          continue;
        }

        // Verify department exists
        const department = await departmentRepository.prisma.findUnique({
          where: { id: studentData.departmentId },
        });
        if (!department) {
          result.failures.push({
            data: studentData,
            error: `Department with ID ${studentData.departmentId} not found`,
          });
          continue;
        }

        // Generate random password
        const password = crypto.randomBytes(8).toString("hex");

        // Create user via better-auth API
        const userResult = await auth.api.signUpEmail({
          body: {
            email: studentData.email,
            password,
            name: studentData.name,
            username: studentData.matricNumber,
          },
        });

        if (!userResult || !userResult.user) {
          result.failures.push({
            data: studentData,
            error: "Failed to create user account via better-auth",
          });
          continue;
        }

        const userId = userResult.user.id;

        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          // Create Student record
          await tx.student.create({
            data: {
              name: studentData.name,
              email: studentData.email,
              matricNumber: studentData.matricNumber,
              department: { connect: { id: studentData.departmentId } },
              user: { connect: { id: userId } },
            },
          });

          // Update User with userType
          await tx.user.update({
            where: { id: userId },
            data: {
              userType: "STUDENT",
            },
          });
        });

        // Send welcome email with credentials
        await notificationService.sendWelcomeEmail({
          email: studentData.email,
          name: studentData.name,
          userType: "Student",
          loginCredential: studentData.matricNumber,
          temporaryPassword: password,
        });

        result.success.push({
          matricNumber: studentData.matricNumber,
          email: studentData.email,
        });

        logger.debug("Student created successfully", {
          matricNumber: studentData.matricNumber,
        });
      } catch (error) {
        result.failures.push({
          data: studentData,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        logger.error("Failed to create student", {
          data: studentData,
          error,
        });
      }
    }

    logger.info("Bulk student creation completed", {
      total: students.length,
      success: result.success.length,
      failures: result.failures.length,
    });

    return result;
  }

  /**
   * Bulk create school supervisors with better-auth
   */
  async bulkCreateSchoolSupervisors(
    supervisors: SchoolSupervisorBulkData[],
  ): Promise<BulkCreationResult<{ staffId: string; email: string }>> {
    const result: BulkCreationResult<{ staffId: string; email: string }> = {
      success: [],
      failures: [],
    };

    logger.info("Starting bulk school supervisor creation", {
      count: supervisors.length,
    });

    for (const supervisorData of supervisors) {
      try {
        // Check if staff ID already exists
        const existingSupervisor =
          await schoolSupervisorRepository.prisma.findUnique({
            where: { staffId: supervisorData.staffId },
          });
        if (existingSupervisor) {
          result.failures.push({
            data: supervisorData,
            error: `Supervisor with staff ID ${supervisorData.staffId} already exists`,
          });
          continue;
        }

        // Check if email already exists
        const existingUser = await userRepository.findByEmail(
          supervisorData.email,
        );
        if (existingUser) {
          result.failures.push({
            data: supervisorData,
            error: `User with email ${supervisorData.email} already exists`,
          });
          continue;
        }

        // Verify department exists
        const department = await departmentRepository.prisma.findUnique({
          where: { id: supervisorData.departmentId },
        });
        if (!department) {
          result.failures.push({
            data: supervisorData,
            error: `Department with ID ${supervisorData.departmentId} not found`,
          });
          continue;
        }

        // Generate random password
        const password = crypto.randomBytes(8).toString("hex");

        // Create user via better-auth API
        const userResult = await auth.api.signUpEmail({
          body: {
            email: supervisorData.email,
            password,
            name: supervisorData.name,
            username: supervisorData.staffId,
          },
        });

        if (!userResult || !userResult.user) {
          result.failures.push({
            data: supervisorData,
            error: "Failed to create user account via better-auth",
          });
          continue;
        }

        const userId = userResult.user.id;

        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          // Create SchoolSupervisor record
          await tx.schoolSupervisor.create({
            data: {
              name: supervisorData.name,
              email: supervisorData.email,
              staffId: supervisorData.staffId,
              department: { connect: { id: supervisorData.departmentId } },
              user: { connect: { id: userId } },
            },
          });

          // Update User with userType
          await tx.user.update({
            where: { id: userId },
            data: {
              userType: "SCHOOL_SUPERVISOR",
            },
          });
        });

        // Send welcome email with credentials
        await notificationService.sendWelcomeEmail({
          email: supervisorData.email,
          name: supervisorData.name,
          userType: "School Supervisor",
          loginCredential: supervisorData.staffId,
          temporaryPassword: password,
        });

        result.success.push({
          staffId: supervisorData.staffId,
          email: supervisorData.email,
        });

        logger.debug("School supervisor created successfully", {
          staffId: supervisorData.staffId,
        });
      } catch (error) {
        result.failures.push({
          data: supervisorData,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        logger.error("Failed to create school supervisor", {
          data: supervisorData,
          error,
        });
      }
    }

    logger.info("Bulk school supervisor creation completed", {
      total: supervisors.length,
      success: result.success.length,
      failures: result.failures.length,
    });

    return result;
  }

  /**
   * Bulk create admin users with better-auth
   */
  async bulkCreateAdminUsers(
    admins: AdminUserBulkData[],
  ): Promise<BulkCreationResult<{ adminId: string; email: string }>> {
    const result: BulkCreationResult<{ adminId: string; email: string }> = {
      success: [],
      failures: [],
    };

    logger.info("Starting bulk admin user creation", { count: admins.length });

    for (const adminData of admins) {
      try {
        // Check if admin ID already exists
        const existingAdmin = await adminUserRepository.prisma.findUnique({
          where: { adminId: adminData.adminId },
        });
        if (existingAdmin) {
          result.failures.push({
            data: adminData,
            error: `Admin with admin ID ${adminData.adminId} already exists`,
          });
          continue;
        }

        // Check if email already exists
        const existingUser = await userRepository.findByEmail(adminData.email);
        if (existingUser) {
          result.failures.push({
            data: adminData,
            error: `User with email ${adminData.email} already exists`,
          });
          continue;
        }

        // Generate random password
        const password = crypto.randomBytes(8).toString("hex");

        // Create user via better-auth API
        const userResult = await auth.api.signUpEmail({
          body: {
            email: adminData.email,
            password,
            name: adminData.name,
            username: adminData.adminId,
          },
        });

        if (!userResult || !userResult.user) {
          result.failures.push({
            data: adminData,
            error: "Failed to create user account via better-auth",
          });
          continue;
        }

        const userId = userResult.user.id;

        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          // Create AdminUser record
          await tx.adminUser.create({
            data: {
              name: adminData.name,
              email: adminData.email,
              adminId: adminData.adminId,
              user: { connect: { id: userId } },
            },
          });

          // Update User with userType
          await tx.user.update({
            where: { id: userId },
            data: {
              userType: "ADMIN",
            },
          });
        });

        // Send welcome email with credentials
        await notificationService.sendWelcomeEmail({
          email: adminData.email,
          name: adminData.name,
          userType: "Admin",
          loginCredential: adminData.adminId,
          temporaryPassword: password,
        });

        result.success.push({
          adminId: adminData.adminId,
          email: adminData.email,
        });

        logger.debug("Admin user created successfully", {
          adminId: adminData.adminId,
        });
      } catch (error) {
        result.failures.push({
          data: adminData,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        logger.error("Failed to create admin user", {
          data: adminData,
          error,
        });
      }
    }

    logger.info("Bulk admin user creation completed", {
      total: admins.length,
      success: result.success.length,
      failures: result.failures.length,
    });

    return result;
  }
}

export const bulkUserCreationService = new BulkUserCreationService();
