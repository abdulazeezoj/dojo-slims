/**
 * @file dashboard-placement.tsx
 * @description Dashboard placement information with self-contained data fetching
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-student-dashboard";
import { Buildings } from "@phosphor-icons/react";
import Link from "next/link";

export function DashboardPlacement() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardPlacementSkeleton />;
  }

  // Critical data - throw to error boundary
  if (error) {
    throw error;
  }

  const placementInfo = dashboardData?.placementInfo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Buildings className="h-5 w-5" />
          Placement Information
        </CardTitle>
        <CardDescription>Your current SIWES placement details</CardDescription>
      </CardHeader>
      <CardContent>
        {placementInfo ? (
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Organization</p>
              <p className="font-medium">{placementInfo.organizationName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Industry Supervisor
              </p>
              <p className="font-medium">
                {placementInfo.industrySupervisorName}
              </p>
            </div>
            {placementInfo.schoolSupervisorName && (
              <div>
                <p className="text-muted-foreground text-sm">
                  School Supervisor
                </p>
                <p className="font-medium">
                  {placementInfo.schoolSupervisorName}
                </p>
              </div>
            )}
            <Link
              href="/student/siwes-details"
              className="text-primary hover:underline text-sm"
            >
              Edit details
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              You haven&apos;t set up your SIWES details yet.
            </p>
            <Link
              href="/student/siwes-details"
              className="text-primary hover:underline text-sm font-medium"
            >
              Set up now
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPlacementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-56" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}
