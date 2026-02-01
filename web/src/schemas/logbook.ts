import { z } from "zod";
import {
  dayOfWeekSchema,
  fileUploadSchema,
  optionalTextSchema,
  textContentSchema,
  uuidSchema,
} from "./common";

/**
 * Logbook-related validation schemas
 */

// Week entry content
export const weekEntryContentSchema = z.object({
  day: dayOfWeekSchema,
  content: textContentSchema,
});

// Update multiple days at once
export const updateWeekEntriesSchema = z.object({
  monday: optionalTextSchema,
  tuesday: optionalTextSchema,
  wednesday: optionalTextSchema,
  thursday: optionalTextSchema,
  friday: optionalTextSchema,
  saturday: optionalTextSchema,
});

// Diagram upload
export const uploadDiagramSchema = fileUploadSchema.extend({
  caption: z.string().max(500).optional(),
});

// Request review
export const requestReviewSchema = z.object({
  weekId: uuidSchema,
});

// Get logbook query
export const getLogbookQuerySchema = z.object({
  sessionId: uuidSchema.optional(),
});

// Week query
export const weekQuerySchema = z.object({
  weekNumber: z.coerce.number().int().min(1).max(24).optional(),
});

// Export types
export type WeekEntryContent = z.infer<typeof weekEntryContentSchema>;
export type UpdateWeekEntries = z.infer<typeof updateWeekEntriesSchema>;
export type UploadDiagram = z.infer<typeof uploadDiagramSchema>;
export type RequestReview = z.infer<typeof requestReviewSchema>;
export type GetLogbookQuery = z.infer<typeof getLogbookQuerySchema>;
export type WeekQuery = z.infer<typeof weekQuerySchema>;
