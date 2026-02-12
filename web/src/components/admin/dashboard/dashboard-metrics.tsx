/**
 * @file dashboard-metrics.tsx
 * @description Display session completion metrics
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminDashboardMetrics } from "@/hooks/use-admin-dashboard";

export function DashboardMetrics() {
  const { data: metrics, isLoading } = useAdminDashboardMetrics();

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
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Metrics</CardTitle>
          <CardDescription>
            Completion rates and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No metrics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Metrics</CardTitle>
        <CardDescription>
          Completion rates and progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead className="text-right">Enrolled</TableHead>
              <TableHead className="text-right">With Details</TableHead>
              <TableHead className="text-right">With Supervisor</TableHead>
              <TableHead>Details Completion</TableHead>
              <TableHead>Supervisor Assignment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.sessionId}>
                <TableCell className="font-medium">
                  {metric.sessionName}
                </TableCell>
                <TableCell className="text-right">
                  {metric.totalEnrolled}
                </TableCell>
                <TableCell className="text-right">
                  {metric.withSiwesDetails}
                </TableCell>
                <TableCell className="text-right">
                  {metric.withSupervisor}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metric.detailsCompletionRate}
                      className="h-2 w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {metric.detailsCompletionRate}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metric.supervisorAssignmentRate}
                      className="h-2 w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {metric.supervisorAssignmentRate}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
