/**
 * Pagination utility functions
 */

import type { PaginatedResult, PaginationParams } from "@/types/pagination";

/**
 * Validate and sanitize pagination parameters
 * Ensures skip >= 0 and take is between 1-100
 *
 * @param params - Raw pagination parameters
 * @param defaultTake - Default number of records to return (default: 20)
 * @returns Validated pagination parameters
 */
export function validatePaginationParams(
  params: PaginationParams,
  defaultTake: number = 20,
): Required<PaginationParams> {
  return {
    skip: Math.max(0, params.skip ?? 0),
    take: Math.min(100, Math.max(1, params.take ?? defaultTake)),
  };
}

/**
 * Create a paginated result object
 *
 * @param data - Array of items for current page
 * @param total - Total count of all items
 * @param skip - Number of records skipped
 * @param take - Number of records requested
 * @returns Paginated result with hasMore flag
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  skip: number,
  take: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    skip,
    take,
    hasMore: skip + data.length < total,
  };
}
