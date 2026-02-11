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

// Types
export interface ProfileData {
  id: string;
  name: string;
  email: string;
  matricNumber: string;
  department: {
    name: string;
    faculty: {
      name: string;
    };
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Hooks
/**
 * Fetch student profile data
 */
export function useProfileData(): UseQueryResult<ProfileData, Error> {
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProfileData>>(
        "/api/student/profile",
      );
      // Unwrap the ApiResponse structure to get the actual data
      return response.data.data as ProfileData;
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword(): UseMutationResult<
  void,
  unknown,
  ChangePasswordData,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      await apiClient.post("/api/auth/change-password", {
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: false,
      });
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to change password");
    },
  });
}
