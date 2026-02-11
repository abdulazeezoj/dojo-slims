/**
 * @file dashboard-stats.tsx
 * @description Dashboard statistics with self-contained data fetching
 */

"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { SectionLoading } from "@/components/student/common/section-loading";
import { StatCard } from "@/components/student/common/stat-card";
import { useDashboardData } from "@/hooks/use-school-supervisor-dashboard";

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

  const { stats } = dashboardData;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        description="Students under supervision"
        icon={<UsersThreeIcon className="h-4 w-4" />}
      />
      <StatCard
        title="Active Students"
        value={stats.activeStudents}
        description="Currently on SIWES"
        icon={<UserIcon className="h-4 w-4" />}
      />
      <StatCard
        title="Pending Reviews"
        value={stats.pendingReviews}
        description="Awaiting your feedback"
        icon={<ClockIcon className="h-4 w-4" />}
      />
      <StatCard
        title="Completed Reviews"
        value={stats.completedReviews}
        description="Total reviews submitted"
        icon={<CheckCircleIcon className="h-4 w-4" />}
      />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return <SectionLoading variant="stats" />;
}
