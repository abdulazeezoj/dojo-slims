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

export interface SchoolSupervisor {
  id: string;
  staffId: string;
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

export interface CreateSchoolSupervisorData {
  staffId: string;
  name: string;
  email: string;
  departmentId: string;
  password: string;
}

export interface UpdateSchoolSupervisorData {
  name?: string;
  email?: string;
  departmentId?: string;
}

export function useAdminSchoolSupervisors(): UseQueryResult<
  { schoolSupervisors: SchoolSupervisor[]; total: number },
  Error
> {
  return useQuery({
    queryKey: ["admin-school-supervisors"],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ schoolSupervisors: SchoolSupervisor[]; total: number }>
      >("/api/admin/school-supervisors");
      return response.data.data as { schoolSupervisors: SchoolSupervisor[]; total: number };
    },
  });
}

export function useCreateSchoolSupervisor(): UseMutationResult<
  SchoolSupervisor,
  unknown,
  CreateSchoolSupervisorData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSchoolSupervisorData) => {
      const response = await apiClient.post<ApiResponse<SchoolSupervisor>>(
        "/api/admin/school-supervisors",
        data,
      );
      return response.data.data as SchoolSupervisor;
    },
    onSuccess: () => {
      toast.success("School supervisor created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-school-supervisors"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create school supervisor");
    },
  });
}

export function useUpdateSchoolSupervisor(): UseMutationResult<
  SchoolSupervisor,
  unknown,
  { id: string; data: UpdateSchoolSupervisorData },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSchoolSupervisorData;
    }) => {
      const response = await apiClient.patch<ApiResponse<SchoolSupervisor>>(
        `/api/admin/school-supervisors/${id}`,
        data,
      );
      return response.data.data as SchoolSupervisor;
    },
    onSuccess: () => {
      toast.success("School supervisor updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-school-supervisors"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update school supervisor");
    },
  });
}

export function useDeleteSchoolSupervisor(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supervisorId: string) => {
      await apiClient.delete(`/api/admin/school-supervisors/${supervisorId}`);
    },
    onSuccess: () => {
      toast.success("School supervisor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-school-supervisors"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete school supervisor");
    },
  });
}

export function useActivateSchoolSupervisor(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supervisorId: string) => {
      await apiClient.post(`/api/admin/school-supervisors/${supervisorId}/activate`);
    },
    onSuccess: () => {
      toast.success("School supervisor activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-school-supervisors"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to activate school supervisor");
    },
  });
}

export function useDeactivateSchoolSupervisor(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supervisorId: string) => {
      await apiClient.post(`/api/admin/school-supervisors/${supervisorId}/deactivate`);
    },
    onSuccess: () => {
      toast.success("School supervisor deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-school-supervisors"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to deactivate school supervisor");
    },
  });
}

export function useBulkUploadSchoolSupervisors(): UseMutationResult<
  { successful: number; failed: number; errors: Array<{ row: number; error: string }> },
  unknown,
  CreateSchoolSupervisorData[],
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supervisors: CreateSchoolSupervisorData[]) => {
      const response = await apiClient.post<
        ApiResponse<{ successful: number; failed: number; errors: Array<{ row: number; error: string }> }>
      >("/api/admin/school-supervisors/bulk-upload", { schoolSupervisors: supervisors });
      return response.data.data as { successful: number; failed: number; errors: Array<{ row: number; error: string }> };
    },
    onSuccess: (data) => {
      if (data.failed === 0) {
        toast.success(`Successfully uploaded ${data.successful} school supervisors`);
      } else {
        toast.warning(
          `Uploaded ${data.successful} school supervisors, ${data.failed} failed`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["admin-school-supervisors"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to upload school supervisors");
    },
  });
}
