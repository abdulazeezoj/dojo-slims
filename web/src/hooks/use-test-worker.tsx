import { api } from "@/lib/api-client";
import { clientConfig } from "@/lib/config-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query key structure for worker-related queries
 */
export const workerKeys = {
  all: ["worker"] as const,
  jobs: () => [...workerKeys.all, "job"] as const,
  job: (jobId: string) => [...workerKeys.jobs(), jobId] as const,
};

export interface QueueJobRequest {
  taskName: string;
  data?: Record<string, unknown>;
}

export interface QueueJobResponse {
  jobId: string;
  taskName: string;
  status: string;
  message: string;
}

export interface JobStatusResponse {
  jobId: string;
  taskName: string;
  state: "waiting" | "active" | "completed" | "failed";
  progress?: number;
  result?: unknown;
  error?: string;
  attempts: number;
  timestamp: number;
}

/**
 * Hook for queuing background jobs
 */
export function useQueueJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: QueueJobRequest) => {
      const response = await api.post<QueueJobResponse>(
        "/api/worker/test",
        request,
      );

      if (!response.success || !response.data) {
        throw new Error("Failed to queue job");
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.jobs() });

      queryClient.setQueryData(workerKeys.job(data.jobId), {
        jobId: data.jobId,
        taskName: data.taskName,
        state: "waiting",
        attempts: 0,
        timestamp: Date.now(),
      });
    },
  });
}

/**
 * Hook for fetching job status with automatic polling
 */
export function useJobStatus(
  jobId: string,
  options?: {
    enabled?: boolean;
    pollingInterval?: number;
    maxAttempts?: number;
  },
) {
  const pollingInterval =
    options?.pollingInterval ?? clientConfig.QUERY_POLLING_INTERVAL_MS;
  const maxAttempts =
    options?.maxAttempts ?? clientConfig.QUERY_MAX_POLLING_ATTEMPTS;

  return useQuery({
    queryKey: workerKeys.job(jobId),
    queryFn: async () => {
      const response = await api.get<JobStatusResponse>(
        `/api/worker/test?jobId=${jobId}`,
      );

      if (!response.success || !response.data) {
        throw new Error("Failed to get job status");
      }

      return response.data;
    },
    enabled: options?.enabled ?? !!jobId,
    refetchInterval: (query) => {
      // Stop polling if disabled or no data
      if (!jobId || !query.state.data) {
        return false;
      }

      const jobState = query.state.data.state;
      const fetchCount = query.state.dataUpdateCount;

      // Stop polling if job is completed or failed
      if (jobState === "completed" || jobState === "failed") {
        return false;
      }

      // Stop polling if max attempts reached
      if (fetchCount >= maxAttempts) {
        return false;
      }

      // Continue polling at configured interval
      return pollingInterval;
    },
    // Keep the query mounted for 5 minutes after it's inactive
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Combined hook for queuing jobs and polling status
 */
export function useTestWorker() {
  const queryClient = useQueryClient();
  const queueJobMutation = useQueueJob();

  const currentJobId = queueJobMutation.data?.jobId ?? "";

  const jobStatus = useJobStatus(currentJobId, {
    enabled: !!currentJobId,
  });

  const isPolling =
    !!currentJobId &&
    jobStatus.data?.state !== "completed" &&
    jobStatus.data?.state !== "failed" &&
    !jobStatus.isError;

  const reset = () => {
    queueJobMutation.reset();
    if (currentJobId) {
      queryClient.removeQueries({ queryKey: workerKeys.job(currentJobId) });
    }
  };

  return {
    // Mutation state
    queueJob: queueJobMutation.mutate,
    isQueueing: queueJobMutation.isPending,
    queueError: queueJobMutation.error,

    // Query state
    jobStatus: jobStatus.data,
    isPolling,
    isFetching: jobStatus.isFetching,
    statusError: jobStatus.error,

    // Combined loading state
    isLoading: queueJobMutation.isPending || isPolling,

    // Combined error
    error: queueJobMutation.error || jobStatus.error,

    // Utility functions
    reset,
    refetchStatus: jobStatus.refetch,
  };
}
