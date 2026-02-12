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
export interface Alert {
  id: string;
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  priority: number;
  createdAt: string | Date;
}

export interface SessionInfo {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "ACTIVE" | "CLOSED";
}

export interface DashboardStats {
  totalWeeks: number;
  completedWeeks: number;
  lockedWeeks: number;
  pendingReviews: number;
}

export interface PlacementInfo {
  organizationName: string;
  industrySupervisorName: string;
  schoolSupervisorName: string | null;
}

export interface DashboardData {
  student: unknown;
  sessions: SessionInfo[];
  activeSession: SessionInfo | null;
  enrollmentInfo: unknown;
  stats: DashboardStats | null;
  placementInfo: PlacementInfo | null;
  alerts: Alert[];
}

export interface SwitchSessionData {
  sessionId: string;
}

// Hooks
/**
 * Fetch dashboard data including sessions, stats, and placement info
 */
export function useDashboardData(): UseQueryResult<DashboardData, Error> {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        "/api/student/dashboard",
      );
      const responseData = response.data;
      // Unwrap the ApiResponse structure to get the actual data
      return responseData.data as DashboardData;
    },
    meta: {
      errorMessage: "Failed to load dashboard data",
    },
  });
}

/**
 * Fetch student alerts
 */
export function useAlertsData(): UseQueryResult<Alert[], Error> {
  return useQuery({
    queryKey: ["student-alerts"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Alert[]>>(
        "/api/student/alerts",
      );
      const responseData = response.data;
      // Unwrap the ApiResponse structure to get the actual data
      return responseData.data as Alert[];
    },
  });
}

/**
 * Get current session ID from dashboard data
 * Uses the persisted currentSiwesSessionId or falls back to activeSession
 */
export function useCurrentSession(): UseQueryResult<string | null, Error> {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        "/api/student/dashboard",
      );
      const responseData = response.data;
      return responseData.data as DashboardData;
    },
    select: (data: DashboardData) => {
      // Return the active session ID if available
      return data.activeSession?.id ?? null;
    },
  });
}

/**
 * Switch active session mutation
 */
export function useSwitchSession(): UseMutationResult<
  void,
  unknown,
  SwitchSessionData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SwitchSessionData) => {
      await apiClient.post("/api/student/sessions/switch", data);
    },
    onSuccess: () => {
      toast.success("Session switched successfully");
      // Invalidate all student queries to refetch with new session
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["student-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["student-logbook"] });
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["student-siwes-details"] });
    },
    onError: (error: unknown) => {
      // Handle rate limiting explicitly
      if (isApiError(error) && error.response?.status === 429) {
        toast.error(
          "Too many requests. Please wait a moment before trying again.",
        );
        return;
      }

      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to switch session");
    },
  });
}
