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

import type { AxiosError } from "axios";

// Types
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
  student: {
    id: string;
    name: string;
    matricNumber: string;
  };
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

export interface AddCommentData {
  content: string;
}

// Hooks
/**
 * Fetch student week data for review
 */
export function useStudentWeekData(
  studentId: string,
  weekId: string,
): UseQueryResult<WeekData, Error> {
  return useQuery({
    queryKey: ["school-supervisor-week", studentId, weekId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeekData>>(
        `/api/school-supervisor/students/${studentId}/weeks/${weekId}`,
      );
      return response.data.data as WeekData;
    },
    enabled: !!studentId && !!weekId,
  });
}

/**
 * Add comment mutation
 */
export function useAddComment(
  studentId: string,
  weekId: string,
): UseMutationResult<void, unknown, AddCommentData, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddCommentData) => {
      await apiClient.post(
        `/api/school-supervisor/students/${studentId}/weeks/${weekId}/comment`,
        data,
      );
    },
    onSuccess: () => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({
        queryKey: ["school-supervisor-week", studentId, weekId],
      });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to add comment");
    },
  });
}

/**
 * Lock week mutation
 */
export function useLockWeek(
  studentId: string,
  weekId: string,
): UseMutationResult<void, unknown, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(
        `/api/school-supervisor/students/${studentId}/weeks/${weekId}/lock`,
      );
    },
    onSuccess: () => {
      toast.success("Week locked successfully");
      queryClient.invalidateQueries({
        queryKey: ["school-supervisor-week", studentId, weekId],
      });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to lock week");
    },
  });
}

/**
 * Unlock week mutation
 */
export function useUnlockWeek(
  studentId: string,
  weekId: string,
): UseMutationResult<void, unknown, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(
        `/api/school-supervisor/students/${studentId}/weeks/${weekId}/unlock`,
      );
    },
    onSuccess: () => {
      toast.success("Week unlocked successfully");
      queryClient.invalidateQueries({
        queryKey: ["school-supervisor-week", studentId, weekId],
      });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to unlock week");
    },
  });
}
