/**
 * @file dashboard-header.tsx
 * @description Dashboard header with self-contained data fetching
 */

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-industry-supervisor-dashboard";
import { PageHeader } from "@/components/student/common/page-header";

export function DashboardHeader() {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return <DashboardHeaderSkeleton />;
  }

  return (
    <PageHeader
      title="Dashboard"
      description="Welcome back! Manage your assigned students and track their progress."
    />
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
