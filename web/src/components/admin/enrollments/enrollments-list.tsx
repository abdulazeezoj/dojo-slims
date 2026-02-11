"use client";

import { useState } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  useAdminEnrollments,
  useDeleteEnrollment,
  type Enrollment,
} from "@/hooks/use-admin-enrollments";

export function EnrollmentsList() {
  const { data, isLoading, error } = useAdminEnrollments();
  const deleteMutation = useDeleteEnrollment();
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);

  const handleDelete = async () => {
    if (enrollmentToDelete) {
      await deleteMutation.mutateAsync(enrollmentToDelete.id);
      setEnrollmentToDelete(null);
    }
  };

  if (isLoading) {
    return <EnrollmentsListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading enrollments: {error.message}
      </div>
    );
  }

  const enrollments = data?.enrollments || [];

  if (enrollments.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No enrollments found</EmptyTitle>
          <EmptyDescription>
            Create your first enrollment to get started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Matric Number</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Enrollment Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell className="font-medium">{enrollment.session.name}</TableCell>
              <TableCell>{enrollment.student.name}</TableCell>
              <TableCell>{enrollment.student.matricNumber}</TableCell>
              <TableCell>{enrollment.student.department.name}</TableCell>
              <TableCell>
                {format(new Date(enrollment.enrolledAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEnrollmentToDelete(enrollment)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!enrollmentToDelete}
        onOpenChange={(open) => !open && setEnrollmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this enrollment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EnrollmentsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}
