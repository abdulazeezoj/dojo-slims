import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

// Types
export interface Alert {
  id: string;
  type: "info" | "warning" | "error";
  message: string;
  priority: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingReviews: number;
  completedReviews: number;
}

export interface Student {
  id: string;
  name: string;
  matricNumber: string;
  department: string;
  faculty: string;
  currentWeek: number;
  totalWeeks: number;
  completionPercentage: number;
  pendingReviews: number;
}

export interface DashboardData {
  stats: DashboardStats;
  alerts: Alert[];
  students: Student[];
}

// Hooks
/**
 * Fetch dashboard data including stats, alerts, and students
 */
export function useDashboardData(): UseQueryResult<DashboardData, Error> {
  return useQuery({
    queryKey: ["industry-supervisor-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        "/api/industry-supervisor/dashboard",
      );
      const responseData = response.data;
      // Unwrap the ApiResponse structure to get the actual data
      return responseData.data as DashboardData;
    },
  });
}

/**
 * Fetch industry supervisor alerts
 */
export function useAlertsData(): UseQueryResult<Alert[], Error> {
  return useQuery({
    queryKey: ["industry-supervisor-alerts"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Alert[]>>(
        "/api/industry-supervisor/alerts",
      );
      const responseData = response.data;
      // Unwrap the ApiResponse structure to get the actual data
      return responseData.data as Alert[];
    },
  });
}
