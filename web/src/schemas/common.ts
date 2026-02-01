import { z } from "zod";

/**
 * Common validation schemas used across multiple endpoints
 */

// UUID validation
export const uuidSchema = z.string().uuid("Invalid ID format");

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const paginationWithSortSchema = paginationSchema.extend({
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema,
});

// Filter schemas
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const searchSchema = z.object({
  search: z.string().min(1).max(255).optional(),
});

// Status filters
export const activeFilterSchema = z.object({
  isActive: z.coerce.boolean().optional(),
});

export const sessionStatusSchema = z.enum(["ACTIVE", "CLOSED"]);

// Week number validation (1-24 for SIWES)
export const weekNumberSchema = z.number().int().min(1).max(24);

// Day of week validation
export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

// File upload validation
export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/),
});

// Email validation
export const emailSchema = z.string().email("Invalid email address");

// Password validation (for Better Auth)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Phone number validation (Nigerian format)
export const phoneSchema = z
  .string()
  .regex(
    /^(\+234|0)[789][01]\d{8}$/,
    "Invalid Nigerian phone number format",
  )
  .optional();

// Matric number validation (flexible format)
export const matricNumberSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[A-Z0-9\/]+$/, "Matric number must contain only uppercase letters, numbers, and /")
  .transform((val) => val.toUpperCase());

// Staff ID validation
export const staffIdSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[A-Z0-9\/]+$/, "Staff ID must contain only uppercase letters, numbers, and /")
  .transform((val) => val.toUpperCase());

// Admin ID validation
export const adminIdSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[A-Z0-9\/]+$/, "Admin ID must contain only uppercase letters, numbers, and /")
  .transform((val) => val.toUpperCase());

// Name validation
export const nameSchema = z.string().min(2).max(255).trim();

// Code validation (for faculty/department codes)
export const codeSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, underscores, and hyphens")
  .transform((val) => val.toUpperCase());

// Text content validation
export const textContentSchema = z.string().min(1).max(5000).trim();

// Optional text content
export const optionalTextSchema = z.string().max(5000).trim().optional();

// Comment validation
export const commentSchema = z.string().min(10).max(2000).trim();

// Rating validation
export const ratingSchema = z.string().max(50).optional();

// Address validation
export const addressSchema = z.string().max(500).trim().optional();

// City/State validation
export const cityStateSchema = z.string().max(100).trim().optional();

// Export types for use in other schemas
export type Pagination = z.infer<typeof paginationSchema>;
export type PaginationWithSort = z.infer<typeof paginationWithSortSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type SessionStatus = z.infer<typeof sessionStatusSchema>;
