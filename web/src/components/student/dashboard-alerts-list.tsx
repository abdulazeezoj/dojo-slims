import { CheckCircleIcon, InfoIcon, WarningIcon } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alert as AlertType } from "@/hooks/use-student-dashboard";

function getAlertIcon(type: AlertType["type"]) {
  switch (type) {
    case "warning":
      return <WarningIcon className="h-4 w-4" />;
    case "success":
      return <CheckCircleIcon className="h-4 w-4" />;
    case "error":
      return <WarningIcon className="h-4 w-4" />;
    default:
      return <InfoIcon className="h-4 w-4" />;
  }
}

interface DashboardAlertsListProps {
  alerts: AlertType[];
  maxAlerts?: number;
}

export function DashboardAlertsList({
  alerts,
  maxAlerts = 3,
}: DashboardAlertsListProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, maxAlerts).map((alert) => (
        <Alert
          key={alert.id}
          variant={
            alert.type === "error" || alert.type === "warning"
              ? "destructive"
              : "default"
          }
        >
          <div className="flex items-start gap-2">
            {getAlertIcon(alert.type)}
            <div className="flex-1 space-y-1">
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(alert.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}

DashboardAlertsList.Skeleton = function DashboardAlertsListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
};
