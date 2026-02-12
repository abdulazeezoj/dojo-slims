import { z } from "zod";

import {
  adminIdSchema,
  codeSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  sessionStatusSchema,
  uuidSchema,
} from "./common";

/**
 * Admin-related validation schemas
 */

// Admin user management

export const createAdminSchema = z.object({
  adminId: adminIdSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const updateAdminSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  isActive: z.boolean().optional(),
});

export const toggleAdminStatusSchema = z.object({
  isActive: z.boolean(),
});

// Faculty & Department management

export const createFacultySchema = z.object({
  name: z.string().min(2).max(255),
  code: codeSchema,
});

export const updateFacultySchema = createFacultySchema.partial();

export const createDepartmentSchema = z.object({
  facultyId: uuidSchema,
  name: z.string().min(2).max(255),
  code: codeSchema,
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  code: codeSchema.optional(),
  facultyId: uuidSchema.optional(),
});

// SIWES Session management

export const createSessionSchema = z
  .object({
    name: z.string().min(4).max(255),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    totalWeeks: z.number().int().min(1).max(52).default(24),
    status: sessionStatusSchema.default("ACTIVE"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateSessionSchema = z.object({
  name: z.string().min(4).max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  totalWeeks: z.number().int().min(1).max(52).optional(),
  status: sessionStatusSchema.optional(),
});

export const closeSessionSchema = z.object({
  reason: z.string().max(500).optional(),
});

// Assignment management

export const manualAssignmentSchema = z.object({
  studentId: uuidSchema,
  schoolSupervisorId: uuidSchema,
  siwesSessionId: uuidSchema,
  adminId: uuidSchema.optional(), // Optional since we use session admin ID
});

export const autoAssignmentSchema = z.object({
  siwesSessionId: uuidSchema,
  criteria: z.enum(["department", "faculty"]).default("department"),
  dryRun: z.boolean().default(false),
});

// Enrollment management

export const enrollStudentSchema = z.object({
  studentId: uuidSchema,
  siwesSessionId: uuidSchema,
});

export const enrollSupervisorSchema = z.object({
  schoolSupervisorId: uuidSchema,
  siwesSessionId: uuidSchema,
});

export const bulkEnrollStudentsSchema = z.object({
  studentIds: z.array(uuidSchema).min(1).max(1000),
  siwesSessionId: uuidSchema,
});

export const bulkEnrollSupervisorsSchema = z.object({
  supervisorIds: z.array(uuidSchema).min(1).max(100),
  siwesSessionId: uuidSchema,
});

// Dashboard filters

export const activityLogFilterSchema = z.object({
  userType: z
    .enum(["ADMIN", "STUDENT", "SCHOOL_SUPERVISOR", "INDUSTRY_SUPERVISOR"])
    .optional(),
  userId: uuidSchema.optional(),
  action: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const dashboardStatsQuerySchema = z.object({
  sessionId: uuidSchema.optional(),
});

// Export types
export type CreateAdmin = z.infer<typeof createAdminSchema>;
export type UpdateAdmin = z.infer<typeof updateAdminSchema>;
export type ToggleAdminStatus = z.infer<typeof toggleAdminStatusSchema>;

export type CreateFaculty = z.infer<typeof createFacultySchema>;
export type UpdateFaculty = z.infer<typeof updateFacultySchema>;
export type CreateDepartment = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartment = z.infer<typeof updateDepartmentSchema>;

export type CreateSession = z.infer<typeof createSessionSchema>;
export type UpdateSession = z.infer<typeof updateSessionSchema>;
export type CloseSession = z.infer<typeof closeSessionSchema>;

export type ManualAssignment = z.infer<typeof manualAssignmentSchema>;
export type AutoAssignment = z.infer<typeof autoAssignmentSchema>;

export type EnrollStudent = z.infer<typeof enrollStudentSchema>;
export type EnrollSupervisor = z.infer<typeof enrollSupervisorSchema>;
export type BulkEnrollStudents = z.infer<typeof bulkEnrollStudentsSchema>;
export type BulkEnrollSupervisors = z.infer<typeof bulkEnrollSupervisorsSchema>;

export type ActivityLogFilter = z.infer<typeof activityLogFilterSchema>;
export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>;
