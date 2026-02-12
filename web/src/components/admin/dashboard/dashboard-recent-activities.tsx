/**
 * @file dashboard-recent-activities.tsx
 * @description Display recent system activities
 */

"use client";

import { Clock } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardActivities } from "@/hooks/use-admin-dashboard";

const userTypeColors: Record<string, "default" | "secondary" | "outline"> = {
  STUDENT: "default",
  ADMIN: "secondary",
  INDUSTRY_SUPERVISOR: "outline",
  SCHOOL_SUPERVISOR: "outline",
};

const actionLabels: Record<string, string> = {
  ENROLLED: "Enrolled",
  ASSIGNED_SUPERVISOR: "Assigned Supervisor",
  COMMENTED: "Added Comment",
};

export function DashboardRecentActivities() {
  const { data: activities, isLoading } = useAdminDashboardActivities(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No recent activities found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest system activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={userTypeColors[activity.userType] || "default"}
                    className="text-xs"
                  >
                    {activity.userType.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm font-medium">
                    {actionLabels[activity.action] || activity.action}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.details}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
