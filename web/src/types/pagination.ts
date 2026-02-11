/**
 * Pagination types for list operations
 */

export interface PaginationParams {
  /**
   * Number of records to skip (offset)
   */
  skip?: number;
  /**
   * Number of records to return (limit)
   */
  take?: number;
}

export interface PaginatedResult<T> {
  /**
   * Array of data items for current page
   */
  data: T[];
  /**
   * Total count of all items (across all pages)
   */
  total: number;
  /**
   * Number of records skipped
   */
  skip: number;
  /**
   * Number of records requested
   */
  take: number;
  /**
   * Whether there are more records after this page
   */
  hasMore: boolean;
}
