import { z } from "zod";

import {
  emailSchema,
  matricNumberSchema,
  nameSchema,
  passwordSchema,
  uuidSchema,
} from "./common";

/**
 * Student-related validation schemas
 */

// Update student profile
export const updateStudentProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

// Create student (admin)
export const createStudentSchema = z.object({
  matricNumber: matricNumberSchema,
  name: nameSchema,
  email: emailSchema,
  departmentId: uuidSchema,
  password: passwordSchema,
});

// Bulk create students
export const bulkCreateStudentsSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(1000),
});

// Update student (admin)
export const updateStudentSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  departmentId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
});

// Student filters
export const studentFilterSchema = z.object({
  departmentId: uuidSchema.optional(),
  facultyId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Session switch
export const switchSessionSchema = z.object({
  sessionId: uuidSchema,
});

// Password change
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Export types
export type UpdateStudentProfile = z.infer<typeof updateStudentProfileSchema>;
export type CreateStudent = z.infer<typeof createStudentSchema>;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;
export type StudentFilter = z.infer<typeof studentFilterSchema>;
export type SwitchSession = z.infer<typeof switchSessionSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
