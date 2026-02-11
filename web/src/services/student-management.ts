/**
 * Student Management Service
 * Handles student CRUD operations from admin perspective with bulk upload
 * Uses better-auth for authentication
 */

import crypto from "crypto";

import type { Prisma, Student } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  departmentRepository,
  studentRepository,
  userRepository,
} from "@/repositories";

import { notificationService } from "./notifications";

export class StudentManagementService {
  /**
   * Get all students with pagination and filtering
   */
  async getAllStudents(params?: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    departmentId?: string;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }): Promise<{ students: Student[]; total: number }> {
    const {
      skip = 0,
      take = 20,
      searchTerm,
      departmentId,
      orderBy,
    } = params || {};

    const where: Prisma.StudentWhereInput = {
      ...(departmentId && { departmentId }),
      ...(searchTerm && {
        OR: [
          { matricNumber: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    };

    const [students, total] = await Promise.all([
      studentRepository.prisma.findMany({ where, skip, take, orderBy }),
      studentRepository.prisma.count({ where }),
    ]);

    return { students, total };
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    return studentRepository.prisma.findUnique({ where: { id } });
  }

  /**
   * Get student by matric number
   */
  async getStudentByMatricNo(matricNumber: string): Promise<Student | null> {
    return studentRepository.findByMatricNumberWithDetails(matricNumber);
  }

  /**
   * Create new student
   */
  async createStudent(data: {
    name: string;
    email: string;
    matricNumber: string;
    departmentId: string;
    password?: string;
  }): Promise<Student> {
    // Check if matric number already exists
    const existingStudent =
      await studentRepository.findByMatricNumberWithDetails(data.matricNumber);
    if (existingStudent) {
      throw new Error(
        `Student with matric number ${data.matricNumber} already exists`,
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

    // Use transaction to ensure data consistency
    // Create Student and update User atomically
    const student = await prisma.$transaction(async (tx) => {
      // Create Student record
      const newStudent = await tx.student.create({
        data: {
          name: data.name,
          email: data.email,
          matricNumber: data.matricNumber,
          department: { connect: { id: data.departmentId } },
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

      return newStudent;
    });

    // Send welcome email with credentials
    await notificationService.sendWelcomeEmail({
      email: data.email,
      name: data.name,
      userType: "Student",
      loginCredential: data.matricNumber,
      temporaryPassword: password,
    });

    return student;
  }

  /**
   * Update student
   */
  async updateStudent(
    id: string,
    data: {
      matricNumber?: string;
      departmentId?: string;
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    },
  ): Promise<Student> {
    const student = await studentRepository.prisma.findUnique({
      where: { id },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Check matric number uniqueness if being changed
    if (data.matricNumber && data.matricNumber !== student.matricNumber) {
      const existing = await studentRepository.findByMatricNumberWithDetails(
        data.matricNumber,
      );
      if (existing) {
        throw new Error(
          `Student with matric number ${data.matricNumber} already exists`,
        );
      }
    }

    // Check email uniqueness if being changed
    if (data.email && data.email !== student.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== student.userId) {
        throw new Error(`User with email ${data.email} already exists`);
      }
    }

    // Update User record if email or name changed
    if (data.email || data.name) {
      await userRepository.prisma.update({
        where: { id: student.userId },
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
      // For admin forcing password change, you might need to use Prisma directly
      // on the Account table or implement a custom auth endpoint
      throw new Error(
        "Password update not implemented. Use password reset flow.",
      );
    }

    // Update student record
    const updateData: Prisma.StudentUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.matricNumber && { matricNumber: data.matricNumber }),
      ...(data.departmentId && {
        department: { connect: { id: data.departmentId } },
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    return studentRepository.updateProfile(id, updateData);
  }

  /**
   * Delete student
   */
  async deleteStudent(id: string): Promise<void> {
    const student = await studentRepository.prisma.findUnique({
      where: { id },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Delete student (cascade delete configured in schema will handle related records)
    await studentRepository.prisma.delete({ where: { id } });

    // Delete the associated User account
    if (student.userId) {
      await userRepository.prisma.delete({ where: { id: student.userId } });
    }
  }

  /**
   * Bulk create students from CSV data
   */
  async bulkCreateStudents(
    students: Array<{
      name: string;
      email: string;
      matricNumber: string;
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
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);

      // Process sequentially to avoid overwhelming better-auth
      for (let index = 0; index < batch.length; index++) {
        const studentData = batch[index];
        const rowNumber = i + index + 1;
        try {
          // Find department by code
          const department = await departmentRepository.prisma.findFirst({
            where: { code: studentData.departmentCode },
          });
          if (!department) {
            errors.push({
              row: rowNumber,
              error: `Department with code ${studentData.departmentCode} not found`,
            });
            failed++;
            continue;
          }

          // Check matric number uniqueness
          const existingStudent =
            await studentRepository.findByMatricNumberWithDetails(
              studentData.matricNumber,
            );
          if (existingStudent) {
            errors.push({
              row: rowNumber,
              error: `Student with matric number ${studentData.matricNumber} already exists`,
            });
            failed++;
            continue;
          }

          // Check email uniqueness
          const existingUser = await userRepository.findByEmail(
            studentData.email,
          );
          if (existingUser) {
            errors.push({
              row: rowNumber,
              error: `User with email ${studentData.email} already exists`,
            });
            failed++;
            continue;
          }

          // Generate random password
          const password = crypto.randomBytes(8).toString("hex");

          // Create user via better-auth
          const userResult = await auth.api.signUpEmail({
            body: {
              email: studentData.email,
              password,
              name: studentData.name,
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

          // Create student
          const _student = await studentRepository.prisma.create({
            data: {
              name: studentData.name,
              email: studentData.email,
              matricNumber: studentData.matricNumber,
              department: { connect: { id: department.id } },
              user: { connect: { id: userId } },
            },
          });

          // Update User with userType
          await userRepository.prisma.update({
            where: { id: userId },
            data: {
              userType: "STUDENT",
            },
          });

          credentials.push({
            email: studentData.email,
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

    // Send bulk welcome emails for all successfully created students
    if (credentials.length > 0) {
      try {
        const emailData = credentials
          .map((cred) => {
            // Find corresponding student data for name and matricNumber
            const studentData = students.find((s) => s.email === cred.email);
            // studentData should always exist since we only add to credentials on success
            if (!studentData) {
              console.error(`Student data not found for ${cred.email}`);
              return null;
            }
            return {
              email: cred.email,
              name: studentData.name,
              userType: "Student",
              loginCredential: studentData.matricNumber,
              temporaryPassword: cred.password,
            };
          })
          .filter((data): data is NonNullable<typeof data> => data !== null);
        
        if (emailData.length > 0) {
          await notificationService.sendBulkWelcomeEmails(emailData);
        }
      } catch (error) {
        // Log error but don't fail the bulk creation
        // Users are created successfully, just email sending failed
        console.error("Failed to send bulk welcome emails:", error);
      }
    }

    return { successful, failed, errors, credentials };
  }

  /**
   * Get student statistics
   */
  async getStudentStats(params?: { departmentId?: string }): Promise<{
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
  }> {
    const where: Prisma.StudentWhereInput = params?.departmentId
      ? { departmentId: params.departmentId }
      : {};

    const [totalStudents, activeStudents] = await Promise.all([
      studentRepository.prisma.count({ where }),
      studentRepository.prisma.count({ where: { ...where, isActive: true } }),
    ]);

    return {
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
    };
  }

  /**
   * Activate student
   */
  async activateStudent(id: string): Promise<Student> {
    const student = await studentRepository.prisma.findUnique({
      where: { id },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    return studentRepository.activate(id);
  }

  /**
   * Deactivate student
   */
  async deactivateStudent(id: string): Promise<Student> {
    const student = await studentRepository.prisma.findUnique({
      where: { id },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    return studentRepository.deactivate(id);
  }
}

export const studentManagementService = new StudentManagementService();
