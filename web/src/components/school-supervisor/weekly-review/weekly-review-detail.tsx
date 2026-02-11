"use client";

import {
  ArrowLeftIcon,
  CalendarIcon,
  ChatCircleIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
  UserIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import Link from "next/link";

import { WeeklyReviewCommentForm } from "@/components/school-supervisor/weekly-review/weekly-review-comment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentWeekData, useLockWeek, useUnlockWeek } from "@/hooks/use-school-supervisor-review";

function WeekNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <WarningCircleIcon className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Week not found</h2>
      <Button
        render={<Link href="/school-supervisor/dashboard">Back to Dashboard</Link>}
      />
    </div>
  );
}

interface WeeklyReviewDetailProps {
  studentId: string;
  weekId: string;
}

export function WeeklyReviewDetail({
  studentId,
  weekId,
}: WeeklyReviewDetailProps) {
  const { data: week, isLoading, error } = useStudentWeekData(studentId, weekId);
  const lockWeekMutation = useLockWeek(studentId, weekId);
  const unlockWeekMutation = useUnlockWeek(studentId, weekId);

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

  const handleLockToggle = async () => {
    if (week.isLocked) {
      await unlockWeekMutation.mutateAsync();
    } else {
      await lockWeekMutation.mutateAsync();
    }
  };

  const isLockActionPending = lockWeekMutation.isPending || unlockWeekMutation.isPending;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link href="/school-supervisor/dashboard">
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back
              </Link>
            }
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Week {week.weekNumber} - {week.student.name}
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
          <Button
            variant={week.isLocked ? "outline" : "default"}
            size="sm"
            onClick={handleLockToggle}
            disabled={isLockActionPending}
          >
            {isLockActionPending ? (
              "Processing..."
            ) : week.isLocked ? (
              <>
                <LockKeyOpenIcon className="mr-1 h-4 w-4" />
                Unlock Week
              </>
            ) : (
              <>
                <LockKeyIcon className="mr-1 h-4 w-4" />
                Lock Week
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Name</Label>
              <p className="font-medium">{week.student.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Matric Number</Label>
              <p className="font-medium">{week.student.matricNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Entries</CardTitle>
          <CardDescription>
            Student&apos;s activities for this week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(week.entries).map(([day, entry]) => {
            if (!entry?.trim()) {
              return null;
            }
            
            return (
              <div key={day} className="space-y-2">
                <Label className="text-sm font-medium capitalize">{day}</Label>
                <div className="bg-muted rounded-md p-3">
                  <p className="whitespace-pre-wrap text-sm">{entry}</p>
                </div>
              </div>
            );
          })}
          {Object.values(week.entries).every(entry => !entry?.trim()) && (
            <p className="text-muted-foreground text-center text-sm">
              No entries submitted for this week yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Diagram */}
      {week.diagram && (
        <Card>
          <CardHeader>
            <CardTitle>Diagram</CardTitle>
            {week.diagram.caption && (
              <CardDescription>{week.diagram.caption}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={week.diagram.url}
              alt="Week diagram"
              className="rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Add Comment Form */}
      <WeeklyReviewCommentForm studentId={studentId} weekId={weekId} isLocked={week.isLocked} />

      {/* Comments Section */}
      {week.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChatCircleIcon className="h-5 w-5" />
              Supervisor Comments
            </CardTitle>
            <CardDescription>
              Feedback from supervisors
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
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Student info skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily entries skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </>
  );
}
