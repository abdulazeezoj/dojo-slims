"use client";

import {
  DashboardHeader,
  DashboardStats,
  DashboardActiveSessions,
  DashboardMetrics,
  DashboardRecentActivities,
} from "@/components/admin/dashboard";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <DashboardHeader />
      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardActiveSessions />
        <DashboardRecentActivities />
      </div>

      <DashboardMetrics />
    </div>
  );
}
