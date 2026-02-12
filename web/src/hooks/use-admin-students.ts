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

export interface Student {
  id: string;
  matricNumber: string;
  name: string;
  email: string;
  departmentId: string;
  department: {
    name: string;
    code: string;
    faculty: {
      name: string;
      code: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
}

export interface CreateStudentData {
  matricNumber: string;
  name: string;
  email: string;
  departmentId: string;
  password: string;
}

export interface UpdateStudentData {
  name?: string;
  email?: string;
  departmentId?: string;
}

export function useAdminStudents(): UseQueryResult<
  { students: Student[]; total: number },
  Error
> {
  return useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ students: Student[]; total: number }>
      >("/api/admin/students");
      return response.data.data as { students: Student[]; total: number };
    },
  });
}

export function useCreateStudent(): UseMutationResult<
  Student,
  unknown,
  CreateStudentData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const response = await apiClient.post<ApiResponse<Student>>(
        "/api/admin/students",
        data,
      );
      return response.data.data as Student;
    },
    onSuccess: () => {
      toast.success("Student created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create student");
    },
  });
}

export function useUpdateStudent(): UseMutationResult<
  Student,
  unknown,
  { id: string; data: UpdateStudentData },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStudentData;
    }) => {
      const response = await apiClient.patch<ApiResponse<Student>>(
        `/api/admin/students/${id}`,
        data,
      );
      return response.data.data as Student;
    },
    onSuccess: () => {
      toast.success("Student updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update student");
    },
  });
}

export function useDeleteStudent(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.delete(`/api/admin/students/${studentId}`);
    },
    onSuccess: () => {
      toast.success("Student deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete student");
    },
  });
}

export function useActivateStudent(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.post(`/api/admin/students/${studentId}/activate`);
    },
    onSuccess: () => {
      toast.success("Student activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to activate student");
    },
  });
}

export function useDeactivateStudent(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.post(`/api/admin/students/${studentId}/deactivate`);
    },
    onSuccess: () => {
      toast.success("Student deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to deactivate student");
    },
  });
}

export function useBulkUploadStudents(): UseMutationResult<
  { successful: number; failed: number; errors: Array<{ row: number; error: string }> },
  unknown,
  CreateStudentData[],
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (students: CreateStudentData[]) => {
      const response = await apiClient.post<
        ApiResponse<{ successful: number; failed: number; errors: Array<{ row: number; error: string }> }>
      >("/api/admin/students/bulk-upload", { students });
      return response.data.data as { successful: number; failed: number; errors: Array<{ row: number; error: string }> };
    },
    onSuccess: (data) => {
      if (data.failed === 0) {
        toast.success(`Successfully uploaded ${data.successful} students`);
      } else {
        toast.warning(
          `Uploaded ${data.successful} students, ${data.failed} failed`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to upload students");
    },
  });
}
