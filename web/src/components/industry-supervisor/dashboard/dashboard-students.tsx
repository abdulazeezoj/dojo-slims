/**
 * @file dashboard-students.tsx
 * @description Student list with self-contained data fetching
 */

"use client";

import { useDashboardData } from "@/hooks/use-industry-supervisor-dashboard";
import {
  CalendarCheckIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/student/common/empty-state";

export function DashboardStudents() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardStudentsSkeleton />;
  }

  // Critical data - throw to error boundary
  if (error) {
    throw error;
  }

  if (!dashboardData) {
    throw new Error("Dashboard data is required but was not returned");
  }

  const { students } = dashboardData;

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            My Students
          </CardTitle>
          <CardDescription>Students assigned to your supervision</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No students assigned"
            message="You don't have any students assigned to you yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          My Students
        </CardTitle>
        <CardDescription>
          Students assigned to your supervision ({students.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => {
            const progressPercentage = Math.round(
              (student.currentWeek / student.totalWeeks) * 100,
            );

            return (
              <div
                key={student.id}
                className="border-muted flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{student.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {student.matricNumber}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-3.5 w-3.5" />
                      {student.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheckIcon className="h-3.5 w-3.5" />
                      Week {student.currentWeek} of {student.totalWeeks}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {student.pendingReviews} pending reviews
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-32 rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {progressPercentage}% complete
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link
                      href={`/industry-supervisor/students/${student.id}`}
                    >
                      <EyeIcon className="mr-1 h-4 w-4" />
                      View
                    </Link>
                  }
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStudentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border-muted flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-2 w-32" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
