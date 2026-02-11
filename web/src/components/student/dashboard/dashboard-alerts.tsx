/**
 * @file dashboard-alerts.tsx
 * @description Dashboard alerts section with self-contained data fetching
 */

"use client";

import { DashboardAlertsList } from "@/components/student/dashboard-alerts-list";
import { useAlertsData } from "@/hooks/use-student-dashboard";
import { SectionError } from "../common/section-error";

export function DashboardAlerts() {
  const { data: alerts, isLoading, error, refetch } = useAlertsData();

  if (isLoading) {
    return <DashboardAlertsList.Skeleton />;
  }

  // Non-critical data - show inline error
  if (error) {
    return (
      <SectionError
        title="Failed to load alerts"
        message="Unable to fetch your alerts at this time."
        onRetry={() => refetch()}
        variant="alert"
      />
    );
  }

  return <DashboardAlertsList alerts={alerts || []} maxAlerts={3} />;
}
