"use client";

import { ChatCircleIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddComment } from "@/hooks/use-school-supervisor-review";

interface WeeklyReviewCommentFormProps {
  studentId: string;
  weekId: string;
  isLocked: boolean;
}

export function WeeklyReviewCommentForm({
  studentId,
  weekId,
  isLocked,
}: WeeklyReviewCommentFormProps) {
  const addCommentMutation = useAddComment(studentId, weekId);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.content.trim()) {
        toast.error("Please enter a comment");
        return;
      }

      try {
        await addCommentMutation.mutateAsync(value);
        // Reset form after successful mutation
        form.reset();
      } catch (_error) {
        // Error already handled by mutation's onError
      }
    },
  });

  if (isLocked) {
    return (
      <Card className="border-muted-foreground/20 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Week Locked</CardTitle>
          <CardDescription>
            This week has been locked and cannot accept new comments.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChatCircleIcon className="h-5 w-5" />
          Add Comment
        </CardTitle>
        <CardDescription>
          Provide feedback to the student on their weekly activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="content">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Comment</Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Enter your feedback for the student..."
                  rows={6}
                  className="resize-none"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-sm">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={
                  !canSubmit || isSubmitting || addCommentMutation.isPending
                }
              >
                {isSubmitting || addCommentMutation.isPending
                  ? "Adding Comment..."
                  : "Add Comment"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
