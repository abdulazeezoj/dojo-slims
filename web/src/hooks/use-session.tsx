"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UserType =
  | "student"
  | "admin"
  | "school_supervisor"
  | "industry_supervisor";

interface UseSessionReturn {
  data: unknown | null;
  isPending: boolean;
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
}

/**
 * Custom hook for managing user session state
 *
 * TODO: This is a placeholder implementation. When dashboard components are built,
 * integrate with Better Auth's actual session management.
 * Better Auth documentation: https://www.better-auth.com/docs/concepts/session
 */
export function useSession(): UseSessionReturn {
  const router = useRouter();
  const [data] = useState<unknown | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO: Replace with actual Better Auth session fetching
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Placeholder - will be replaced with authClient.getSession() or similar
        setIsPending(false);
      } catch (err) {
        setError(err as Error);
        setIsPending(false);
      }
    };

    checkSession();
  }, []);

  // Extract user type from session data
  const userType: UserType | null = null; // TODO: Extract from session metadata

  useEffect(() => {
    if (data?.session?.expiresAt) {
      const expiryTime = new Date(data.session.expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry <= 0) {
        toast.error("Your session has expired. Please sign in again.");

        const redirectMap: Record<UserType, string> = {
          student: "/auth/login/student",
          admin: "/auth/login/admin",
          school_supervisor: "/auth/login/school-supervisor",
          industry_supervisor: "/auth/login/industry-supervisor",
        };

        const redirectUrl = userType ? redirectMap[userType] : "/auth";

        setTimeout(() => {
          router.push(redirectUrl);
        }, 3000);
      }
    }
  }, [data?.session?.expiresAt, userType, router]);

  const isAuthenticated = !!data?.user;

  return {
    data,
    isPending,
    error,
    isAuthenticated,
    isStudent: userType === "student",
    isAdmin: userType === "admin",
    isSchoolSupervisor: userType === "school_supervisor",
    isIndustrySupervisor: userType === "industry_supervisor",
    userId: data?.user?.id || null,
    userType,
    email: data?.user?.email || null,
    username: data?.user?.username || data?.user?.displayUsername || null,
  };
}
