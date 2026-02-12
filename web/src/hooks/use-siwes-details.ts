import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient, isApiError } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { useStudentSiwesSession } from "@/contexts/student-siwes-session";

import type { AxiosError } from "axios";

// Types
export interface Organization {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
}

export interface SiwesDetailsData {
  placementOrganizationId?: string;
  organizationName?: string;
  organizationAddress: string;
  organizationCity: string;
  organizationState: string;
  organizationPhone: string;
  organizationEmail?: string;

  industrySupervisorName: string;
  industrySupervisorEmail: string;
  industrySupervisorPosition?: string;
  industrySupervisorPhone: string;

  trainingStartDate: Date;
  trainingEndDate: Date;
  jobTitle?: string;
  departmentAtOrg?: string;

  programOfStudy: string;
  level: string;
  session: string;
  trainingDuration: string;
  areaOfSpecialization?: string;
}

// Hooks
/**
 * Fetch existing SIWES details
 */
export function useSiwesDetailsData(): UseQueryResult<
  SiwesDetailsData | null,
  Error
> {
  return useQuery({
    queryKey: ["siwes-details"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SiwesDetailsData>>(
        "/api/student/siwes-details",
      );
      return response.data.data ?? null;
    },
  });
}

/**
 * Fetch available organizations
 */
export function useOrganizations(): UseQueryResult<Organization[], Error> {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Organization[]>>(
        "/api/admin/organizations",
      );
      return response.data.data ?? [];
    },
  });
}

/**
 * Save SIWES details mutation
 */
export function useSaveSiwesDetails(): UseMutationResult<
  void,
  unknown,
  SiwesDetailsData,
  unknown
> {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { activeSession } = useStudentSiwesSession();

  return useMutation({
    mutationFn: async (data: SiwesDetailsData) => {
      const sessionId = activeSession?.id;

      if (!sessionId) {
        throw new Error(
          "No active session found. Please enroll in a session first.",
        );
      }

      const payload = {
        ...data,
        trainingStartDate: new Date(data.trainingStartDate),
        trainingEndDate: new Date(data.trainingEndDate),
      };
      await apiClient.post(
        `/api/student/siwes-details?sessionId=${sessionId}`,
        payload,
      );
    },
    onSuccess: () => {
      toast.success("SIWES details saved successfully");
      queryClient.invalidateQueries({ queryKey: ["siwes-details"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      router.push("/student/dashboard");
    },
    onError: (error: unknown) => {
      const errorMessage = isApiError(error)
        ? (error as AxiosError<ApiResponse>).response?.data?.error?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(errorMessage || "Failed to save SIWES details");
    },
  });
}
