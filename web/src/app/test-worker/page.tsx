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
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";

interface JobResult {
  jobId: string;
  taskName: string;
  state?: string;
  result?: any;
  error?: string;
}

export default function TestWorkerPage() {
  const [taskName, setTaskName] = useState("health.healthCheck");
  const [loading, setLoading] = useState(false);
  const [jobResult, setJobResult] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setJobResult(null);

    try {
      // Add job to queue
      const response = await fetch("/api/worker/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName,
          data: {},
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to queue job");
      }

      const data = await response.json();
      const jobId = data.data.jobId;

      // Poll for job status
      let attempts = 0;
      const maxAttempts = 30;

      const checkStatus = async () => {
        const statusResponse = await fetch(`/api/worker/test?jobId=${jobId}`);
        const statusData = await statusResponse.json();

        if (statusData.data.state === "completed") {
          setJobResult(statusData.data);
          setLoading(false);
        } else if (statusData.data.state === "failed") {
          setJobResult(statusData.data);
          setError(statusData.data.error || "Job failed");
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 1000);
        } else {
          setError("Job timeout - taking too long");
          setLoading(false);
        }
      };

      setTimeout(checkStatus, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
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
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : "Run Task"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {jobResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Job Result</CardTitle>
                {getStateBadge(jobResult.state)}
              </div>
              <CardDescription>Job ID: {jobResult.jobId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">
                  Task Name
                </Label>
                <p className="font-mono text-sm">{jobResult.taskName}</p>
              </div>

              {jobResult.result && (
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Result
                  </Label>
                  <pre className="bg-muted mt-2 overflow-auto rounded-md p-4 text-xs">
                    {JSON.stringify(jobResult.result, null, 2)}
                  </pre>
                </div>
              )}

              {jobResult.error && (
                <div>
                  <Label className="text-destructive text-xs">Error</Label>
                  <p className="text-destructive mt-1 text-sm">
                    {jobResult.error}
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
