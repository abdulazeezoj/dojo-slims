"use client";

import { ShieldCheckIcon, WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

type UserType =
  | "student"
  | "admin"
  | "school_supervisor"
  | "industry_supervisor";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserType[];
  fallbackUrl?: string;
  showUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackUrl,
  showUnauthorized = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isPending, userType } = useSession();

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      const defaultFallback = fallbackUrl || "/auth";
      router.push(defaultFallback);
    }
  }, [isPending, isAuthenticated, fallbackUrl, router]);

  if (isPending) {
    return (
      <div className="container mx-auto space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && userType) {
    const hasAccess = allowedRoles.includes(userType);

    if (!hasAccess) {
      if (!showUnauthorized) {
        return null;
      }

      const dashboardMap: Record<UserType, string> = {
        student: "/student",
        admin: "/admin",
        school_supervisor: "/school-supervisor",
        industry_supervisor: "/industry-supervisor",
      };

      const userDashboard = dashboardMap[userType];

      return (
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Alert className="border-destructive/50">
              <WarningIcon className="h-4 w-4" weight="duotone" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You don&apos;t have permission to access this page. This area is
                restricted to {allowedRoles.join(", ")} roles only.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Link href={userDashboard}>
                <Button className="w-full" size="lg">
                  <ShieldCheckIcon className="h-4 w-4" weight="duotone" />
                  Go to My Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
