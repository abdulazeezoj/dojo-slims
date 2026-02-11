/**
 * @file dashboard-stats.tsx
 * @description Admin dashboard statistics cards
 */

"use client";

import {
  UsersThree,
  UserCheck,
  Buildings,
  BookOpen,
  ChartLine,
} from "@phosphor-icons/react";

import { StatCard } from "@/components/student/common/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardStats } from "@/hooks/use-admin-dashboard";

export function DashboardStats() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Active Sessions"
        value={stats.activeSessions}
        description="Currently running sessions"
        icon={<ChartLine className="h-4 w-4" />}
      />
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        description="Registered students"
        icon={<UsersThree className="h-4 w-4" />}
      />
      <StatCard
        title="Total Supervisors"
        value={stats.totalSupervisors}
        description="School supervisors"
        icon={<UserCheck className="h-4 w-4" />}
      />
      <StatCard
        title="Organizations"
        value={stats.totalOrganizations}
        description="Placement organizations"
        icon={<Buildings className="h-4 w-4" />}
      />
      <StatCard
        title="Active Enrollments"
        value={stats.activeEnrollments}
        description="Students in active sessions"
        icon={<BookOpen className="h-4 w-4" />}
      />
    </div>
  );
}
