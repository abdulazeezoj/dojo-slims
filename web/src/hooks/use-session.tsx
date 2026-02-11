"use client";

import { authClient } from "@/lib/auth-client";

type UserType =
  | "student"
  | "admin"
  | "school_supervisor"
  | "industry_supervisor";

interface UseSessionReturn {
  data: unknown | null;
  isPending: boolean;
  isRefetching: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isSchoolSupervisor: boolean;
  isIndustrySupervisor: boolean;
  userId: string | null;
  userType: UserType | null;
  email: string | null;
  username: string | null;
  refetch: () => void;
}

/**
 * Custom hook for managing user session state
 * Integrates with Better Auth's useSession hook
 */
export function useSession(): UseSessionReturn {
  // Use Better Auth's built-in useSession hook
  const { data, isPending, error, isRefetching, refetch } =
    authClient.useSession();

  // Extract user type from session data - normalize from uppercase DB values
  // Note: userType is stored as a custom field, access it through type assertion
  const userType: UserType | null =
    data?.user && (data.user as any)?.userType
      ? (((data.user as any).userType as string).toLowerCase() as UserType)
      : null;

  const isAuthenticated = !!data?.user;

  return {
    data,
    isPending,
    isRefetching,
    error: error || null,
    isAuthenticated,
    isStudent: userType === "student",
    isAdmin: userType === "admin",
    isSchoolSupervisor: userType === "school_supervisor",
    isIndustrySupervisor: userType === "industry_supervisor",
    userId: data?.user?.id || null,
    userType,
    email: data?.user?.email || null,
    username:
      data?.user?.username || (data?.user as any)?.displayUsername || null,
    refetch,
  };
}
