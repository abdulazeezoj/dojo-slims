import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient, isApiError } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { useStudentSiwesSession } from "@/contexts/student-siwes-session";

import type { AxiosError } from "axios";

// Types
export interface Week {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  hasEntries: boolean;
  hasIndustrySupervisorComment: boolean;
  hasSchoolSupervisorComment: boolean;
  reviewRequestedAt: string | null;
  completionPercentage: number;
}

export interface LogbookData {
  weeks: Week[];
  totalWeeks: number;
  completedWeeks: number;
  lockedWeeks: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  supervisor: {
    name: string;
    type: "INDUSTRY" | "SCHOOL";
  };
}

export interface WeekData {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  reviewRequestedAt: string | null;
  entries: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
  };
  diagram: {
    url: string;
    caption?: string;
  } | null;
  comments: Comment[];
}

export interface UpdateWeekEntriesData {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
}

// Hooks
/**
 * Fetch logbook overview with all weeks
 * @param sessionId - Optional session ID. If not provided, uses current session from context
 */
export function useLogbookData(
  sessionId?: string,
): UseQueryResult<LogbookData, Error> {
  const { activeSession } = useStudentSiwesSession();
  const effectiveSessionId = sessionId || activeSession?.id;

  return useQuery({
    queryKey: ["student-logbook", effectiveSessionId],
    queryFn: async () => {
      if (!effectiveSessionId) {
        throw new Error("No session selected");
      }
      const response = await apiClient.get<ApiResponse<LogbookData>>(
        `/api/student/logbook?sessionId=${effectiveSessionId}`,
      );
      return response.data.data as LogbookData;
    },
    enabled: !!effectiveSessionId,
  });
}

/**
 * Fetch individual week data with entries and comments
 */
export function useWeekData(weekId: string): UseQueryResult<WeekData, Error> {
  return useQuery({
    queryKey: ["week", weekId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeekData>>(
        `/api/student/logbook/weeks/${weekId}`,
      );
      return response.data.data as WeekData;
    },
    enabled: !!weekId,
  });
}

/**
 * Update week entries mutation
 */
export function useUpdateWeekEntries(
  weekId: string,
): UseMutationResult<void, unknown, UpdateWeekEntriesData, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWeekEntriesData) => {
      await apiClient.post(
        `/api/student/logbook/weeks/${weekId}/entries`,
        data,
      );
    },
    onSuccess: () => {
      toast.success("Entries saved successfully");
      queryClient.invalidateQueries({ queryKey: ["week", weekId] });
      queryClient.invalidateQueries({ queryKey: ["student-logbook"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to save entries");
    },
  });
}

/**
 * Upload diagram mutation
 */
export function useUploadDiagram(
  weekId: string,
): UseMutationResult<void, unknown, FormData, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      await apiClient.post(
        `/api/student/logbook/weeks/${weekId}/diagram`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    },
    onSuccess: () => {
      toast.success("Diagram uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["week", weekId] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to upload diagram");
    },
  });
}

/**
 * Request review mutation
 */
export function useRequestReview(
  weekId: string,
): UseMutationResult<void, unknown, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(
        `/api/student/logbook/weeks/${weekId}/request-review`,
      );
    },
    onSuccess: () => {
      toast.success("Review requested successfully");
      queryClient.invalidateQueries({ queryKey: ["week", weekId] });
      queryClient.invalidateQueries({ queryKey: ["student-logbook"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to request review");
    },
  });
}
