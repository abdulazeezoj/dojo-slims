"use client";

import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLogbookData, type Week } from "@/hooks/use-student-logbook";

export function LogbookWeeksTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getWeekStatus(week: Week) {
  if (week.isLocked) {
    return {
      label: "Locked",
      variant: "secondary" as const,
      icon: LockKeyIcon,
    };
  }
  if (week.hasIndustrySupervisorComment || week.hasSchoolSupervisorComment) {
    return {
      label: "Reviewed",
      variant: "default" as const,
      icon: CheckCircleIcon,
    };
  }
  if (week.reviewRequestedAt) {
    return {
      label: "Pending Review",
      variant: "destructive" as const,
      icon: ClockIcon,
    };
  }
  if (week.hasEntries) {
    return {
      label: "In Progress",
      variant: "default" as const,
      icon: BookOpenIcon,
    };
  }
  return {
    label: "Not Started",
    variant: "outline" as const,
    icon: BookOpenIcon,
  };
}

export function LogbookWeeksTable() {
  const { data: logbook, isLoading, isRefetching } = useLogbookData();

  // Show skeleton during refetch for better UX
  if (isLoading || (!logbook && isRefetching)) {
    return (
      <div className="space-y-4">
        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weeks = logbook?.weeks || [];
  const stats = {
    total: logbook?.totalWeeks || 0,
    completed: logbook?.completedWeeks || 0,
    locked: logbook?.lockedWeeks || 0,
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weeks</CardTitle>
            <BookOpenIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">Training period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Weeks
            </CardTitle>
            <CheckCircleIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-muted-foreground text-xs">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              % progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Weeks</CardTitle>
            <LockKeyIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.locked}</div>
            <p className="text-muted-foreground text-xs">
              Reviewed and finalized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weeks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Entries</CardTitle>
          <CardDescription>
            Click on any week to view or edit your entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No weeks available</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Weeks will appear here once your SIWES session starts.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Week</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="w-32">Progress</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-32">Comments</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((week) => {
                  const status = getWeekStatus(week);
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={week.id}>
                      <TableCell className="font-medium">
                        Week {week.weekNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(week.startDate), "MMM d")} -{" "}
                        {format(new Date(week.endDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{week.completionPercentage}%</span>
                          </div>
                          <div className="bg-secondary h-2 w-full rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all"
                              style={{
                                width: `${week.completionPercentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {week.hasIndustrySupervisorComment && (
                            <Badge variant="outline" className="text-xs">
                              I
                            </Badge>
                          )}
                          {week.hasSchoolSupervisorComment && (
                            <Badge variant="outline" className="text-xs">
                              S
                            </Badge>
                          )}
                          {!week.hasIndustrySupervisorComment &&
                            !week.hasSchoolSupervisorComment && (
                              <span className="text-muted-foreground text-xs">
                                None
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/student/logbook/${week.id}`}>
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
