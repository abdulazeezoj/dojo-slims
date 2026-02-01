import { z } from "zod";

import { commentSchema, ratingSchema } from "./common";

/**
 * Review and comment-related validation schemas
 */

// Add weekly comment (supervisor)
export const addWeeklyCommentSchema = z.object({
  comment: commentSchema,
});

// Add final comment
export const addFinalCommentSchema = z.object({
  comment: commentSchema,
  rating: ratingSchema,
});

// Lock/unlock week
export const lockWeekSchema = z.object({
  reason: z.string().max(500).optional(),
});

// Review request status update
export const updateReviewStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "expired"]),
});

// Export types
export type AddWeeklyComment = z.infer<typeof addWeeklyCommentSchema>;
export type AddFinalComment = z.infer<typeof addFinalCommentSchema>;
export type LockWeek = z.infer<typeof lockWeekSchema>;
export type UpdateReviewStatus = z.infer<typeof updateReviewStatusSchema>;
