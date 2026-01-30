import { QueryClient } from "@tanstack/react-query";
import { getLogger } from "./logger";

const logger = getLogger(["lib", "query-client"]);

const queryConfig = {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: 1,
    retryDelay: 1000,
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
