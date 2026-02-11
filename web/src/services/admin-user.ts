/**
 * AdminUser User Service
 * Handles CRUD operations for admin users from admin perspective
 * Uses better-auth for authentication
 */

import crypto from "crypto";

import type { AdminUser, Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { adminUserRepository, userRepository } from "@/repositories";

export class AdminUserService {
  /**
   * Get all admin users with pagination and filtering
   */
  async getAllAdmins(params?: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    orderBy?: Prisma.AdminUserOrderByWithRelationInput;
  }): Promise<{ admins: AdminUser[]; total: number }> {
    const { skip = 0, take = 20, searchTerm } = params || {};

    const [admins, total] = await Promise.all([
      searchTerm
        ? adminUserRepository.searchByNameOrEmail(searchTerm, { skip, take })
        : adminUserRepository.findAll({ skip, take }),
      adminUserRepository.countAll(),
    ]);

    return { admins, total };
  }

  /**
   * Get admin user by ID
   */
  async getAdminById(id: string): Promise<AdminUser | null> {
    return adminUserRepository.prisma.findUnique({
      where: { id },
    });
  }

  /**
   * Get admin user by user ID
   */
  async getAdminByUserId(userId: string): Promise<AdminUser | null> {
    return adminUserRepository.findByUserIdWithDetails(userId);
  }

  /**
   * Create new admin user
   */
  async createAdmin(data: {
    adminId: string;
    name: string;
    email: string;
    password?: string;
    isActive?: boolean;
  }): Promise<AdminUser> {
    // Check if admin already exists
    const existsByAdminId = await adminUserRepository.existsByAdminId(
      data.adminId,
    );
    if (existsByAdminId) {
      throw new Error("Admin with this adminId already exists");
    }

    const existsByEmail = await adminUserRepository.existsByEmail(data.email);
    if (existsByEmail) {
      throw new Error("Admin with this email already exists");
    }

    // Check if email already exists in User table
    const userExists = await userRepository.existsByEmail(data.email);
    if (userExists) {
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
        username: data.adminId,
      },
    });

    if (!userResult || !userResult.user) {
      throw new Error("Failed to create user account");
    }

    const userId = userResult.user.id;

    // Use transaction to ensure data consistency
    // Create Admin and update User atomically
    const admin = await prisma.$transaction(async (tx) => {
      // Create admin record
      const newAdmin = await tx.adminUser.create({
        data: {
          adminId: data.adminId,
          name: data.name,
          email: data.email,
          user: { connect: { id: userId } },
          isActive: data.isActive ?? true,
        },
      });

      // Update User with userType
      await tx.user.update({
        where: { id: userId },
        data: {
          userType: "ADMIN",
        },
      });

      return newAdmin;
    });

    return admin;
  }

  /**
   * Update admin user
   */
  async updateAdmin(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    },
  ): Promise<AdminUser> {
    const admin = await adminUserRepository.prisma.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    // Check email uniqueness if updating email
    if (data.email && data.email !== admin.email) {
      const existsByEmail = await adminUserRepository.existsByEmail(data.email);
      if (existsByEmail) {
        throw new Error("Admin with this email already exists");
      }

      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== admin.userId) {
        throw new Error(`User with email ${data.email} already exists`);
      }
    }

    // Update User record if email or name changed
    if (data.email || data.name) {
      await userRepository.prisma.update({
        where: { id: admin.userId },
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

    // Update admin record
    const updateData: Prisma.AdminUserUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    return adminUserRepository.updateProfile(id, updateData);
  }

  /**
   * Delete admin user
   */
  async deleteAdmin(id: string): Promise<void> {
    const admin = await adminUserRepository.prisma.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    // Delete admin record (cascade delete configured in schema will handle related records)
    await adminUserRepository.delete(id);

    // Delete the associated User account
    if (admin.userId) {
      await userRepository.prisma.delete({
        where: { id: admin.userId },
      });
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<{
    totalAdmins: number;
    activeAdmins: number;
    inactiveAdmins: number;
  }> {
    const [totalAdmins, activeAdmins] = await Promise.all([
      adminUserRepository.countAll(),
      adminUserRepository.countActive(),
    ]);

    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
    };
  }

  /**
   * Activate an admin user
   */
  async activateAdmin(id: string): Promise<AdminUser> {
    const admin = await adminUserRepository.prisma.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    return adminUserRepository.activate(id);
  }

  /**
   * Deactivate an admin user
   */
  async deactivateAdmin(id: string): Promise<AdminUser> {
    const admin = await adminUserRepository.prisma.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    return adminUserRepository.deactivate(id);
  }
}

export const adminUserService = new AdminUserService();
