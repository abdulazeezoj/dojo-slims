"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTestWorker } from "@/hooks/use-test-worker";
import { formatApiError } from "@/lib/api-client";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function TestWorker() {
  const [taskName, setTaskName] = useState("health.healthCheck");
  const { queueJob, jobStatus, isLoading, error, reset } = useTestWorker();

  const handleSubmit = () => {
    reset();
    queueJob({ taskName, data: {} });
  };

  const getStateBadge = (state?: string) => {
    switch (state) {
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircleIcon size={14} weight="fill" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircleIcon size={14} weight="fill" />
            Failed
          </Badge>
        );
      case "active":
      case "waiting":
        return (
          <Badge variant="secondary" className="gap-1">
            <ClockIcon size={14} weight="fill" />
            Processing
          </Badge>
        );
      default:
        return <Badge variant="outline">{state || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="container mx-auto min-h-screen p-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Worker Test Page</h1>
          <p className="text-muted-foreground">
            Test BullMQ workers and background tasks
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Queue a Task</CardTitle>
            <CardDescription>
              Add a job to the queue and see the results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task">Task Type</Label>
              <Select
                value={taskName}
                onValueChange={(value) => {
                  if (value) setTaskName(value);
                }}
              >
                <SelectTrigger id="task">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health.healthCheck">
                    Health Check
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Processing..." : "Run Task"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{formatApiError(error)}</AlertDescription>
          </Alert>
        )}

        {jobStatus && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Job Result</CardTitle>
                {getStateBadge(jobStatus.state)}
              </div>
              <CardDescription>Job ID: {jobStatus.jobId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">
                  Task Name
                </Label>
                <p className="font-mono text-sm">{jobStatus.taskName}</p>
              </div>

              {jobStatus.result !== undefined && (
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Result
                  </Label>
                  <pre className="bg-muted mt-2 overflow-auto rounded-md p-4 text-xs">
                    {JSON.stringify(jobStatus.result, null, 2)}
                  </pre>
                </div>
              )}

              {jobStatus.error && (
                <div>
                  <Label className="text-destructive text-xs">Error</Label>
                  <p className="text-destructive mt-1 text-sm">
                    {jobStatus.error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Note</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>
              Make sure your worker is running with{" "}
              <code className="bg-background rounded px-1">bun run worker</code>
            </p>
            <p>
              Redis must be running and configured correctly in your environment
              variables.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
