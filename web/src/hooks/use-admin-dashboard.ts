import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

// Types
export interface DashboardStats {
  activeSessions: number;
  totalStudents: number;
  totalSupervisors: number;
  totalOrganizations: number;
  activeEnrollments: number;
}

export interface SessionWithCount {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "CLOSED";
  studentCount: number;
}

export interface SessionMetrics {
  sessionId: string;
  sessionName: string;
  totalEnrolled: number;
  withSiwesDetails: number;
  withSupervisor: number;
  detailsCompletionRate: number;
  supervisorAssignmentRate: number;
}

export interface RecentActivity {
  id: string;
  userType: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: Date;
}

// Hooks
/**
 * Fetch dashboard statistics
 */
export function useAdminDashboardStats(): UseQueryResult<
  DashboardStats,
  Error
> {
  return useQuery({
    queryKey: ["admin-dashboard", "stats"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        "/api/admin/dashboard",
      );
      return response.data.data as DashboardStats;
    },
  });
}

/**
 * Fetch active sessions with student counts
 */
export function useAdminDashboardSessions(): UseQueryResult<
  SessionWithCount[],
  Error
> {
  return useQuery({
    queryKey: ["admin-dashboard", "sessions"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SessionWithCount[]>>(
        "/api/admin/dashboard/sessions",
      );
      return response.data.data as SessionWithCount[];
    },
  });
}

/**
 * Fetch session metrics
 */
export function useAdminDashboardMetrics(): UseQueryResult<
  SessionMetrics[],
  Error
> {
  return useQuery({
    queryKey: ["admin-dashboard", "metrics"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SessionMetrics[]>>(
        "/api/admin/dashboard/metrics",
      );
      return response.data.data as SessionMetrics[];
    },
  });
}

/**
 * Fetch recent activities
 */
export function useAdminDashboardActivities(
  limit = 20,
): UseQueryResult<RecentActivity[], Error> {
  return useQuery({
    queryKey: ["admin-dashboard", "activities", limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
        `/api/admin/dashboard/activities?limit=${limit}`,
      );
      return response.data.data as RecentActivity[];
    },
  });
}
