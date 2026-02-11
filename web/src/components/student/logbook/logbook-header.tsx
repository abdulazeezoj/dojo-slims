"use client";

import { DashboardSessionSwitcher } from "@/components/student/dashboard-session-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-student-dashboard";
import { PageHeader } from "../common/page-header";

export function LogbookHeader() {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return <LogbookHeaderSkeleton />;
  }

  const activeSession = dashboardData?.activeSession;
  const availableSessions = dashboardData?.sessions || [];

  return (
    <PageHeader
      title="My Logbook"
      description="Manage your weekly SIWES entries and track progress."
      action={
        activeSession && availableSessions.length > 1 ? (
          <DashboardSessionSwitcher
            currentSession={activeSession}
            availableSessions={availableSessions}
          />
        ) : undefined
      }
    />
  );
}

export function LogbookHeaderSkeleton() {
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
