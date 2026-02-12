"use client";

import {
  ArrowLeftIcon,
  CalendarIcon,
  ChatCircleIcon,
  LockKeyIcon,
  UserIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import Link from "next/link";

import { LogbookDiagramUpload } from "@/components/student/logbook/logbook-diagram-upload";
import { LogbookRequestReview } from "@/components/student/logbook/logbook-request-review";
import { LogbookWeekEntriesForm } from "@/components/student/logbook/logbook-week-entries-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeekData } from "@/hooks/use-student-logbook";

function WeekNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <WarningCircleIcon className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Week not found</h2>
      <Button render={<Link href="/student/logbook">Back to Logbook</Link>} />
    </div>
  );
}

interface WeekDetailProps {
  weekId: string;
}

export function LogbookWeekDetail({ weekId }: WeekDetailProps) {
  const { data: week, isLoading, error } = useWeekData(weekId);

  if (isLoading) {
    return <WeekDetailSkeleton />;
  }

  if (error) {
    // Critical data - bubble to error boundary
    throw error;
  }

  if (!week) {
    return <WeekNotFound />;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student/logbook">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Week {week.weekNumber}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(week.startDate), "MMM d")} -{" "}
              {format(new Date(week.endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {week.isLocked && (
            <Badge variant="secondary">
              <LockKeyIcon className="mr-1 h-3 w-3" />
              Locked
            </Badge>
          )}
          {week.reviewRequestedAt && !week.isLocked && (
            <Badge variant="destructive">
              <CalendarIcon className="mr-1 h-3 w-3" />
              Review Requested
            </Badge>
          )}
        </div>
      </div>

      {/* Lock Warning */}
      {week.isLocked && (
        <Card className="border-muted-foreground/20 bg-muted/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockKeyIcon className="h-5 w-5" />
              <CardTitle className="text-base">Week Locked</CardTitle>
            </div>
            <CardDescription>
              This week has been locked by a supervisor and can no longer be
              edited.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Daily Entries Form */}
      <LogbookWeekEntriesForm week={week} weekId={weekId} />

      <Separator />

      {/* Diagram Upload */}
      <LogbookDiagramUpload week={week} weekId={weekId} />

      <Separator />

      {/* Request Review */}
      <LogbookRequestReview week={week} weekId={weekId} />

      {/* Comments Section */}
      {week.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChatCircleIcon className="h-5 w-5" />
              Supervisor Comments
            </CardTitle>
            <CardDescription>
              Feedback from your industry and school supervisors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {week.comments.map((comment) => (
              <div
                key={comment.id}
                className="border-muted rounded-lg border p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {comment.supervisor.name}
                    </span>
                    <Badge
                      variant={
                        comment.supervisor.type === "INDUSTRY"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {comment.supervisor.type === "INDUSTRY"
                        ? "Industry"
                        : "School"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(comment.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export function WeekDetailSkeleton() {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Entries form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Diagram skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>

      {/* Review skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    </>
  );
}
