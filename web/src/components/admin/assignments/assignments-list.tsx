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
  useAdminAssignments,
  useDeleteAssignment,
  type Assignment,
} from "@/hooks/use-admin-assignments";

export function AssignmentsList() {
  const { data, isLoading, error } = useAdminAssignments();
  const deleteMutation = useDeleteAssignment();
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  const handleDelete = async () => {
    if (assignmentToDelete) {
      await deleteMutation.mutateAsync(assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  if (isLoading) {
    return <AssignmentsListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading assignments: {error.message}
      </div>
    );
  }

  const assignments = data?.assignments || [];

  if (assignments.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No assignments found</EmptyTitle>
          <EmptyDescription>
            Create your first assignment to get started.
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
            <TableHead>Supervisor</TableHead>
            <TableHead>Staff ID</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>{assignment.session.name}</TableCell>
              <TableCell className="font-medium">{assignment.student.name}</TableCell>
              <TableCell>{assignment.student.matricNumber}</TableCell>
              <TableCell>{assignment.schoolSupervisor.name}</TableCell>
              <TableCell>{assignment.schoolSupervisor.staffId}</TableCell>
              <TableCell>
                {format(new Date(assignment.assignedAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setAssignmentToDelete(assignment)}
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
        open={!!assignmentToDelete}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AssignmentsListSkeleton() {
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
