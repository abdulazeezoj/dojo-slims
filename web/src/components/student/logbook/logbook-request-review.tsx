"use client";

import { PaperPlaneTiltIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequestReview, type WeekData } from "@/hooks/use-student-logbook";

interface LogbookRequestReviewProps {
  week: WeekData;
  weekId: string;
}

export function LogbookRequestReview({
  week,
  weekId,
}: LogbookRequestReviewProps) {
  const requestReviewMutation = useRequestReview(weekId);

  // Don't show if week is locked or review already requested
  if (week.isLocked || week.reviewRequestedAt) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PaperPlaneTiltIcon className="h-5 w-5" />
          Request Review
        </CardTitle>
        <CardDescription>
          Submit this week for industry supervisor review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => requestReviewMutation.mutate()}
          disabled={requestReviewMutation.isPending}
        >
          <PaperPlaneTiltIcon className="mr-1 h-4 w-4" />
          {requestReviewMutation.isPending ? "Requesting..." : "Request Review"}
        </Button>
      </CardContent>
    </Card>
  );
}
