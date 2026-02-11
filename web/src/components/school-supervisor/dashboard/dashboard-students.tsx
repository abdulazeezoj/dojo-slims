/**
 * @file dashboard-students.tsx
 * @description Dashboard students list with self-contained data fetching
 */

"use client";

import { useDashboardData } from "@/hooks/use-school-supervisor-dashboard";
import { UserIcon } from "@phosphor-icons/react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SectionLoading } from "@/components/student/common/section-loading";
import { EmptyState } from "@/components/student/common/empty-state";

export function DashboardStudents() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardStudentsSkeleton />;
  }

  // Not critical - show empty state if error
  if (error) {
    throw error;
  }

  if (!dashboardData) {
    throw new Error("Dashboard data is required");
  }

  const { students } = dashboardData;

  if (!students || students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Students
          </CardTitle>
          <CardDescription>Students assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No students assigned"
            description="You don't have any students assigned to you yet."
            icon={<UserIcon className="h-12 w-12" />}
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
          Students
        </CardTitle>
        <CardDescription>
          {students.length} student{students.length !== 1 ? "s" : ""} assigned
          to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {student.matricNumber}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">{student.department}</p>
                    <p className="text-muted-foreground text-xs">
                      {student.faculty}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 w-32">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Week {student.currentWeek}/{student.totalWeeks}
                      </span>
                    </div>
                    <Progress
                      value={student.completionPercentage}
                      className="h-2"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {student.pendingReviews > 0 ? (
                    <Badge variant="destructive">
                      {student.pendingReviews}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">0</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    render={
                      <Link href={`/school-supervisor/students/${student.id}`}>
                        View
                      </Link>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function DashboardStudentsSkeleton() {
  return <SectionLoading variant="table" />;
}
