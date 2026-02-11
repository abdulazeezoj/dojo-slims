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
import type { CreateOrganization, UpdateOrganization } from "@/schemas";

import type { AxiosError } from "axios";

export interface Organization {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string | null;
  createdAt: Date;
}

export interface OrganizationsResponse {
  organizations: Organization[];
  total: number;
}

export interface BulkUploadResult {
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export function useOrganizations(): UseQueryResult<
  OrganizationsResponse,
  Error
> {
  return useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<OrganizationsResponse>>(
        "/api/admin/organizations",
      );
      return response.data.data as OrganizationsResponse;
    },
  });
}

export function useCreateOrganization(): UseMutationResult<
  Organization,
  unknown,
  CreateOrganization,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganization) => {
      const response = await apiClient.post<ApiResponse<Organization>>(
        "/api/admin/organizations",
        data,
      );
      return response.data.data as Organization;
    },
    onSuccess: () => {
      toast.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create organization");
    },
  });
}

export function useUpdateOrganization(): UseMutationResult<
  Organization,
  unknown,
  { id: string; data: UpdateOrganization },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrganization;
    }) => {
      const response = await apiClient.patch<ApiResponse<Organization>>(
        `/api/admin/organizations/${id}`,
        data,
      );
      return response.data.data as Organization;
    },
    onSuccess: () => {
      toast.success("Organization updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update organization");
    },
  });
}

export function useDeleteOrganization(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      await apiClient.delete(`/api/admin/organizations/${organizationId}`);
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to delete organization");
    },
  });
}

export function useBulkUploadOrganizations(): UseMutationResult<
  BulkUploadResult,
  unknown,
  Array<CreateOrganization>,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizations: Array<CreateOrganization>) => {
      const response = await apiClient.post<ApiResponse<BulkUploadResult>>(
        "/api/admin/organizations/bulk-upload",
        { organizations },
      );
      return response.data.data as BulkUploadResult;
    },
    onSuccess: (data) => {
      if (data.failed > 0) {
        toast.warning(
          `Bulk upload completed: ${data.successful} successful, ${data.failed} failed`,
        );
      } else {
        toast.success(`Successfully uploaded ${data.successful} organizations`);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to bulk upload organizations");
    },
  });
}
