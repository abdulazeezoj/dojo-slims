/**
 * @file dashboard-active-sessions.tsx
 * @description Display active SIWES sessions with enrollment counts
 */

"use client";

import { CalendarBlank, UsersThree } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardSessions } from "@/hooks/use-admin-dashboard";

export function DashboardActiveSessions() {
  const { data: sessions, isLoading } = useAdminDashboardSessions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Currently running SIWES sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No active sessions found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Currently running SIWES sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{session.name}</h4>
                  <Badge variant="default" className="text-xs">
                    {session.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarBlank className="h-3 w-3" />
                    <span>
                      {new Date(session.startDate).toLocaleDateString()} -{" "}
                      {new Date(session.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UsersThree className="h-4 w-4" />
                <span className="text-lg font-semibold">
                  {session.studentCount}
                </span>
                <span className="text-sm">students</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
