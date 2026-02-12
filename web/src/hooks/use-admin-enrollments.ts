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

export interface Enrollment {
  id: string;
  sessionId: string;
  session: {
    name: string;
    startDate: Date;
    endDate: Date;
  };
  studentId: string;
  student: {
    name: string;
    matricNumber: string;
    department: {
      name: string;
    };
  };
  enrolledAt: Date;
}

export interface CreateEnrollmentData {
  sessionId: string;
  studentId: string;
}

export interface BulkEnrollData {
  sessionId: string;
  studentIds: string[];
}

export function useAdminEnrollments(): UseQueryResult<
  { enrollments: Enrollment[]; total: number },
  Error
> {
  return useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ enrollments: Enrollment[]; total: number }>
      >("/api/admin/enrollments");
      return response.data.data as { enrollments: Enrollment[]; total: number };
    },
  });
}

export function useCreateEnrollment(): UseMutationResult<
  Enrollment,
  unknown,
  CreateEnrollmentData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEnrollmentData) => {
      const response = await apiClient.post<ApiResponse<Enrollment>>(
        "/api/admin/enrollments",
        data,
      );
      return response.data.data as Enrollment;
    },
    onSuccess: () => {
      toast.success("Enrollment created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create enrollment");
    },
  });
}

export function useDeleteEnrollment(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      await apiClient.delete(`/api/admin/enrollments/${enrollmentId}`);
    },
    onSuccess: () => {
      toast.success("Enrollment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete enrollment");
    },
  });
}

export function useBulkEnroll(): UseMutationResult<
  { enrolled: number; message: string },
  unknown,
  BulkEnrollData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkEnrollData) => {
      const response = await apiClient.post<
        ApiResponse<{ enrolled: number; message: string }>
      >("/api/admin/enrollments/bulk", data);
      return response.data.data as { enrolled: number; message: string };
    },
    onSuccess: (data) => {
      toast.success(data.message || `Enrolled ${data.enrolled} students`);
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to enroll students");
    },
  });
}
