import { z } from "zod";

import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
  staffIdSchema,
  uuidSchema,
} from "./common";

/**
 * Supervisor-related validation schemas
 */

// School Supervisor schemas

export const createSchoolSupervisorSchema = z.object({
  staffId: staffIdSchema,
  name: nameSchema,
  email: emailSchema,
  departmentId: uuidSchema,
  password: passwordSchema,
});

export const updateSchoolSupervisorSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  departmentId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateSchoolSupervisorProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

export const schoolSupervisorFilterSchema = z.object({
  departmentId: uuidSchema.optional(),
  facultyId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Industry Supervisor schemas

export const createIndustrySupervisorSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  placementOrganizationId: uuidSchema,
  position: z.string().max(255).optional(),
  phone: phoneSchema,
});

export const updateIndustrySupervisorSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  position: z.string().max(255).optional(),
  phone: phoneSchema,
  isActive: z.boolean().optional(),
});

export const updateIndustrySupervisorProfileSchema = z.object({
  name: nameSchema.optional(),
  position: z.string().max(255).optional(),
  phone: phoneSchema,
});

export const industrySupervisorFilterSchema = z.object({
  placementOrganizationId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Email update (industry supervisor only - triggers new magic link)
export const updateIndustrySupervisorEmailSchema = z.object({
  email: emailSchema,
});

// Export types
export type CreateSchoolSupervisor = z.infer<
  typeof createSchoolSupervisorSchema
>;
export type UpdateSchoolSupervisor = z.infer<
  typeof updateSchoolSupervisorSchema
>;
export type UpdateSchoolSupervisorProfile = z.infer<
  typeof updateSchoolSupervisorProfileSchema
>;
export type SchoolSupervisorFilter = z.infer<
  typeof schoolSupervisorFilterSchema
>;

export type CreateIndustrySupervisor = z.infer<
  typeof createIndustrySupervisorSchema
>;
export type UpdateIndustrySupervisor = z.infer<
  typeof updateIndustrySupervisorSchema
>;
export type UpdateIndustrySupervisorProfile = z.infer<
  typeof updateIndustrySupervisorProfileSchema
>;
export type IndustrySupervisorFilter = z.infer<
  typeof industrySupervisorFilterSchema
>;
export type UpdateIndustrySupervisorEmail = z.infer<
  typeof updateIndustrySupervisorEmailSchema
>;
