/**
 * @file dashboard-stats.tsx
 * @description Dashboard statistics with self-contained data fetching
 */

"use client";

import { useDashboardData } from "@/hooks/use-student-dashboard";
import {
  CalendarCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import { SectionLoading } from "../common/section-loading";
import { StatCard } from "../common/stat-card";

export function DashboardStats() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardStatsSkeleton />;
  }

  // Critical data - throw to error boundary
  if (error) {
    throw error;
  }

  if (!dashboardData) {
    throw new Error("Dashboard data is required but was not returned");
  }

  const { stats, activeSession } = dashboardData;
  const progressPercentage = stats
    ? Math.round((stats.completedWeeks / stats.totalWeeks) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Weeks"
        value={stats?.totalWeeks || 0}
        description={activeSession?.name || "No active session"}
        icon={<CalendarCheckIcon className="h-4 w-4" />}
      />
      <StatCard
        title="Completed Weeks"
        value={stats?.completedWeeks || 0}
        description={`${progressPercentage}% progress`}
        icon={<CheckCircleIcon className="h-4 w-4" />}
      />
      <StatCard
        title="Locked Weeks"
        value={stats?.lockedWeeks || 0}
        description="Reviewed and finalized"
        icon={<LockKeyIcon className="h-4 w-4" />}
      />
      <StatCard
        title="Pending Reviews"
        value={stats?.pendingReviews || 0}
        description="Awaiting supervisor feedback"
        icon={<ClockIcon className="h-4 w-4" />}
      />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return <SectionLoading variant="stats" />;
}
