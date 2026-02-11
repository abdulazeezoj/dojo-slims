/**
 * @file dashboard-header.tsx
 * @description Dashboard header with session switcher and self-contained data fetching
 */

"use client";

import { DashboardSessionSwitcher } from "@/components/student/dashboard-session-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-student-dashboard";
import { PageHeader } from "../common/page-header";

export function DashboardHeader() {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return <DashboardHeaderSkeleton />;
  }

  const activeSession = dashboardData?.activeSession;
  const availableSessions = dashboardData?.sessions || [];

  return (
    <PageHeader
      title="Dashboard"
      description="Welcome back! Here's your SIWES progress overview."
      action={
        activeSession && availableSessions.length > 1 ? (
          <DashboardSessionSwitcher
            currentSession={activeSession}
            availableSessions={availableSessions}
          />
        ) : activeSession ? (
          <div className="text-sm text-muted-foreground">
            Current Session: <span className="font-medium text-foreground">{activeSession.name}</span>
          </div>
        ) : undefined
      }
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
      <Skeleton className="h-10 w-48" />
    </div>
  );
}
