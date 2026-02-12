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
import type { CreateSession, UpdateSession } from "@/schemas";

import type { AxiosError } from "axios";

export interface Session {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "CLOSED";
  totalWeeks: number;
}

export function useAdminSessions(): UseQueryResult<Session[], Error> {
  return useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Session[]>>(
        "/api/admin/sessions",
      );
      return response.data.data as Session[];
    },
  });
}

export function useCreateSession(): UseMutationResult<
  Session,
  unknown,
  CreateSession,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSession) => {
      const response = await apiClient.post<ApiResponse<Session>>(
        "/api/admin/sessions",
        data,
      );
      return response.data.data as Session;
    },
    onSuccess: () => {
      toast.success("Session created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to create session");
    },
  });
}

export function useUpdateSession(): UseMutationResult<
  Session,
  unknown,
  { id: string; data: UpdateSession },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSession }) => {
      const response = await apiClient.patch<ApiResponse<Session>>(
        `/api/admin/sessions/${id}`,
        data,
      );
      return response.data.data as Session;
    },
    onSuccess: () => {
      toast.success("Session updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to update session");
    },
  });
}

export function useCloseSession(): UseMutationResult<
  void,
  unknown,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.post(`/api/admin/sessions/${sessionId}/close`);
    },
    onSuccess: () => {
      toast.success("Session closed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to close session");
    },
  });
}
