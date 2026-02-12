import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

import { getLogger } from "./logger";

const logger = getLogger(["lib", "query-client"]);

const queryConfig = {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors (except 429 - rate limit)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 429) {
          // Retry rate limit errors up to 2 times
          return failureCount < 2;
        }
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number, error: unknown) => {
      // Use exponential backoff with longer delays for rate limits
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return Math.min(5000 * 2 ** attemptIndex, 60000);
      }
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  },
  mutations: {
    retry: (failureCount: number, error: unknown) => {
      // Don't retry mutations on 4xx errors (except 429 - rate limit)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 429) {
          // Retry rate limit errors up to 2 times
          return failureCount < 2;
        }
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },
    retryDelay: (attemptIndex: number, error: unknown) => {
      // Use exponential backoff with longer delays for rate limits
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return Math.min(5000 * 2 ** attemptIndex, 60000);
      }
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    gcTime: 5 * 60 * 1000,
  },
};

function onError(error: Error) {
  logger.error("Query error", {
    message: error.message,
    name: error.name,
    stack: error.stack,
  });
}

/**
 * Create QueryClient with custom configuration
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      ...queryConfig,
      mutations: {
        ...queryConfig.mutations,
        onError,
      },
    },
  });
}
