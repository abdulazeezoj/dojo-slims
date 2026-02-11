"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
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
import {
  useUpdateWeekEntries,
  type WeekData,
} from "@/hooks/use-student-logbook";
import { updateWeekEntriesSchema } from "@/schemas/logbook";

interface LogbookWeekEntriesFormProps {
  week: WeekData;
  weekId: string;
}

const days = [
  { key: "monday" as const, label: "Monday" },
  { key: "tuesday" as const, label: "Tuesday" },
  { key: "wednesday" as const, label: "Wednesday" },
  { key: "thursday" as const, label: "Thursday" },
  { key: "friday" as const, label: "Friday" },
  { key: "saturday" as const, label: "Saturday" },
];

export function LogbookWeekEntriesForm({
  week,
  weekId,
}: LogbookWeekEntriesFormProps) {
  const router = useRouter();
  const updateEntriesMutation = useUpdateWeekEntries(weekId);

  const form = useForm({
    defaultValues: {
      monday: week.entries.monday || "",
      tuesday: week.entries.tuesday || "",
      wednesday: week.entries.wednesday || "",
      thursday: week.entries.thursday || "",
      friday: week.entries.friday || "",
      saturday: week.entries.saturday || "",
    },
    onSubmit: async ({ value }) => {
      const result = updateWeekEntriesSchema.safeParse(value);
      if (!result.success) {
        toast.error(result.error.issues[0]?.message || "Validation failed");
        return;
      }
      updateEntriesMutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Daily Entries (Monday - Saturday)</CardTitle>
          <CardDescription>
            Document your daily activities during the training week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <form.Field key={day.key} name={day.key}>
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{day.label}</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={`Describe your activities on ${day.label}...`}
                    rows={4}
                    disabled={week.isLocked}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          ))}
        </CardContent>
      </Card>

      {!week.isLocked && (
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={
                  !canSubmit || isSubmitting || updateEntriesMutation.isPending
                }
              >
                <FloppyDiskIcon className="mr-1 h-4 w-4" />
                {isSubmitting || updateEntriesMutation.isPending
                  ? "Saving..."
                  : "Save Entries"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      )}
    </form>
  );
}
