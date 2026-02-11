/**
 * @file dashboard-alerts.tsx
 * @description Dashboard alerts section with self-contained data fetching
 */

"use client";

import { useDashboardData } from "@/hooks/use-school-supervisor-dashboard";
import {
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SectionLoading } from "@/components/student/common/section-loading";

export function DashboardAlerts() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardAlertsSkeleton />;
  }

  // Not critical - just show nothing if error
  if (error || !dashboardData) {
    return null;
  }

  const { alerts } = dashboardData;

  // Don't show section if no alerts
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Sort by priority (higher priority first)
  const sortedAlerts = [...alerts].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-4">
      {sortedAlerts.map((alert) => {
        const Icon =
          alert.type === "error"
            ? XCircleIcon
            : alert.type === "warning"
              ? WarningCircleIcon
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
  return <SectionLoading variant="alerts" />;
}
