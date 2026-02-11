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
import type {
  CreateDepartment,
  CreateFaculty,
  UpdateDepartment,
  UpdateFaculty,
} from "@/schemas";

import type { AxiosError } from "axios";

export interface Faculty {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty: {
    name: string;
    code: string;
  };
  createdAt: Date;
}

export function useFaculties(): UseQueryResult<Faculty[], Error> {
  return useQuery({
    queryKey: ["admin-faculties"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Faculty[]>>(
        "/api/admin/faculties",
      );
      return response.data.data as Faculty[];
    },
  });
}

export function useDepartments(): UseQueryResult<Department[], Error> {
  return useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Department[]>>(
        "/api/admin/departments",
      );
      return response.data.data as Department[];
    },
  });
}

export function useCreateFaculty(): UseMutationResult<
  Faculty,
  unknown,
  CreateFaculty,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFaculty) => {
      const response = await apiClient.post<ApiResponse<Faculty>>(
        "/api/admin/faculties",
        data,
      );
      return response.data.data as Faculty;
    },
    onSuccess: () => {
      toast.success("Faculty created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create faculty");
    },
  });
}

export function useUpdateFaculty(): UseMutationResult<
  Faculty,
  unknown,
  { id: string; data: UpdateFaculty },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFaculty }) => {
      const response = await apiClient.patch<ApiResponse<Faculty>>(
        `/api/admin/faculties/${id}`,
        data,
      );
      return response.data.data as Faculty;
    },
    onSuccess: () => {
      toast.success("Faculty updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update faculty");
    },
  });
}

export function useDeleteFaculty(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facultyId: string) => {
      await apiClient.delete(`/api/admin/faculties/${facultyId}`);
    },
    onSuccess: () => {
      toast.success("Faculty deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete faculty");
    },
  });
}

export function useCreateDepartment(): UseMutationResult<
  Department,
  unknown,
  CreateDepartment,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartment) => {
      const response = await apiClient.post<ApiResponse<Department>>(
        "/api/admin/departments",
        data,
      );
      return response.data.data as Department;
    },
    onSuccess: () => {
      toast.success("Department created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create department");
    },
  });
}

export function useUpdateDepartment(): UseMutationResult<
  Department,
  unknown,
  { id: string; data: UpdateDepartment },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDepartment;
    }) => {
      const response = await apiClient.patch<ApiResponse<Department>>(
        `/api/admin/departments/${id}`,
        data,
      );
      return response.data.data as Department;
    },
    onSuccess: () => {
      toast.success("Department updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update department");
    },
  });
}

export function useDeleteDepartment(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string) => {
      await apiClient.delete(`/api/admin/departments/${departmentId}`);
    },
    onSuccess: () => {
      toast.success("Department deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete department");
    },
  });
}
