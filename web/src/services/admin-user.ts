/**
 * AdminUser User Service
 * Handles CRUD operations for admin users from admin perspective
 * Uses better-auth for authentication
 */

import { AdminUser, Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { adminRepository, userRepository } from "@/repositories";
import crypto from "crypto";

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
    const { skip = 0, take = 20, searchTerm, orderBy } = params || {};

    const where: Prisma.AdminUserWhereInput = searchTerm
      ? {
          OR: [
            { email: { contains: searchTerm, mode: "insensitive" } },
            { name: { contains: searchTerm, mode: "insensitive" } },
            { adminId: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : {};

    const [admins, total] = await Promise.all([
      adminRepository.findMany({ where, skip, take, orderBy }),
      adminRepository.count(where),
    ]);

    return { admins, total };
  }

  /**
   * Get admin user by ID
   */
  async getAdminById(id: string): Promise<AdminUser | null> {
    return adminRepository.findById(id);
  }

  /**
   * Get admin user by user ID
   */
  async getAdminByUserId(userId: string): Promise<AdminUser | null> {
    return adminRepository.findByUserId(userId);
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
    const existingByAdminId = await adminRepository.findByAdminId(data.adminId);
    if (existingByAdminId) {
      throw new Error("Admin with this adminId already exists");
    }

    const existingByEmail = await adminRepository.findByEmail(data.email);
    if (existingByEmail) {
      throw new Error("Admin with this email already exists");
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
        username: data.adminId,
      },
    });

    if (!userResult || !userResult.user) {
      throw new Error("Failed to create user account");
    }

    const userId = userResult.user.id;

    // Create admin record
    const admin = await adminRepository.create({
      adminId: data.adminId,
      name: data.name,
      email: data.email,
      betterAuthUserId: userId,
      isActive: data.isActive ?? true,
    });

    // Update User with userType
    await userRepository.update(userId, {
      userType: "ADMIN",
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
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    // Check email uniqueness if updating email
    if (data.email && data.email !== admin.email) {
      const existingByEmail = await adminRepository.findByEmail(data.email);
      if (existingByEmail) {
        throw new Error("Admin with this email already exists");
      }

      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== admin.betterAuthUserId) {
        throw new Error(`User with email ${data.email} already exists`);
      }
    }

    // Update User record if email or name changed
    if (data.email || data.name) {
      await userRepository.update(admin.betterAuthUserId, {
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

    // Update admin record
    const updateData: Prisma.AdminUserUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    return adminRepository.update(id, updateData);
  }

  /**
   * Delete admin user
   */
  async deleteAdmin(id: string): Promise<void> {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    // Delete admin record (cascade delete configured in schema will handle related records)
    await adminRepository.delete(id);

    // Delete the associated User account
    if (admin.betterAuthUserId) {
      await userRepository.delete(admin.betterAuthUserId);
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
      adminRepository.count({}),
      adminRepository.count({ isActive: true }),
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
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    return adminRepository.activate(id);
  }

  /**
   * Deactivate an admin user
   */
  async deactivateAdmin(id: string): Promise<AdminUser> {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new Error("AdminUser not found");
    }

    return adminRepository.deactivate(id);
  }
}

export const adminUserService = new AdminUserService();
