/**
 * @file dashboard-alerts.tsx
 * @description Dashboard alerts with self-contained data fetching
 */

"use client";

import { useDashboardData } from "@/hooks/use-industry-supervisor-dashboard";
import { InfoIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/student/common/section-error";

export function DashboardAlerts() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardAlertsSkeleton />;
  }

  // Non-critical - show inline error
  if (error) {
    return (
      <SectionError
        title="Failed to load alerts"
        message="There was a problem loading your alerts. Please try again."
      />
    );
  }

  if (!dashboardData?.alerts || dashboardData.alerts.length === 0) {
    return null;
  }

  const { alerts } = dashboardData;

  // Sort by priority (higher priority first)
  const sortedAlerts = [...alerts].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert) => {
        const Icon =
          alert.type === "error"
            ? XCircleIcon
            : alert.type === "warning"
              ? WarningIcon
              : InfoIcon;

        const variant =
          alert.type === "error"
            ? "destructive"
            : alert.type === "warning"
              ? "default"
              : "default";

        return (
          <Alert key={alert.id} variant={variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>
              {alert.type === "error"
                ? "Error"
                : alert.type === "warning"
                  ? "Warning"
                  : "Information"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}

export function DashboardAlertsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="mb-2 h-5 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
