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

export interface Assignment {
  id: string;
  sessionId: string;
  session: {
    name: string;
  };
  studentId: string;
  student: {
    name: string;
    matricNumber: string;
    department: {
      name: string;
    };
  };
  schoolSupervisorId: string;
  schoolSupervisor: {
    name: string;
    staffId: string;
    department: {
      name: string;
    };
  };
  assignedAt: Date;
}

export interface CreateAssignmentData {
  sessionId: string;
  studentId: string;
  schoolSupervisorId: string;
}

export interface AutoAssignData {
  sessionId: string;
  departmentId?: string;
}

export function useAdminAssignments(): UseQueryResult<
  { assignments: Assignment[]; total: number },
  Error
> {
  return useQuery({
    queryKey: ["admin-assignments"],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ assignments: Assignment[]; total: number }>
      >("/api/admin/assignments");
      return response.data.data as { assignments: Assignment[]; total: number };
    },
  });
}

export function useCreateAssignment(): UseMutationResult<
  Assignment,
  unknown,
  CreateAssignmentData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAssignmentData) => {
      const response = await apiClient.post<ApiResponse<Assignment>>(
        "/api/admin/assignments",
        data,
      );
      return response.data.data as Assignment;
    },
    onSuccess: () => {
      toast.success("Assignment created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-assignments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create assignment");
    },
  });
}

export function useDeleteAssignment(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiClient.delete(`/api/admin/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      toast.success("Assignment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-assignments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete assignment");
    },
  });
}

export function useAutoAssign(): UseMutationResult<
  { assigned: number; message: string },
  unknown,
  AutoAssignData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AutoAssignData) => {
      const response = await apiClient.post<
        ApiResponse<{ assigned: number; message: string }>
      >("/api/admin/assignments/auto-assign", data);
      return response.data.data as { assigned: number; message: string };
    },
    onSuccess: (data) => {
      toast.success(data.message || `Auto-assigned ${data.assigned} students`);
      queryClient.invalidateQueries({ queryKey: ["admin-assignments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to auto-assign students");
    },
  });
}
