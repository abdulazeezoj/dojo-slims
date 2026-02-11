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
import type { CreateAdmin, UpdateAdmin } from "@/schemas";

import type { AxiosError } from "axios";

export interface AdminUser {
  id: string;
  adminId: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export function useAdminUsers(): UseQueryResult<
  { admins: AdminUser[]; total: number },
  Error
> {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ admins: AdminUser[]; total: number }>
      >("/api/admin/users");
      return response.data.data as { admins: AdminUser[]; total: number };
    },
  });
}

export function useCreateAdminUser(): UseMutationResult<
  AdminUser,
  unknown,
  CreateAdmin,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdmin) => {
      const response = await apiClient.post<ApiResponse<AdminUser>>(
        "/api/admin/users",
        data,
      );
      return response.data.data as AdminUser;
    },
    onSuccess: () => {
      toast.success("Admin user created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create admin user");
    },
  });
}

export function useUpdateAdminUser(): UseMutationResult<
  AdminUser,
  unknown,
  { id: string; data: UpdateAdmin },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAdmin }) => {
      const response = await apiClient.patch<ApiResponse<AdminUser>>(
        `/api/admin/users/${id}`,
        data,
      );
      return response.data.data as AdminUser;
    },
    onSuccess: () => {
      toast.success("Admin user updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update admin user");
    },
  });
}

export function useDeleteAdminUser(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast.success("Admin user deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete admin user");
    },
  });
}
