"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon, CheckCircle, XCircle } from "@phosphor-icons/react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useAdminStudents,
  useDeleteStudent,
  useActivateStudent,
  useDeactivateStudent,
  type Student,
} from "@/hooks/use-admin-students";
import { StudentFormDialog } from "./student-form-dialog";

export function StudentsList() {
  const { data, isLoading, error } = useAdminStudents();
  const deleteMutation = useDeleteStudent();
  const activateMutation = useActivateStudent();
  const deactivateMutation = useDeactivateStudent();
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleDelete = async () => {
    if (studentToDelete) {
      await deleteMutation.mutateAsync(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleActivate = async (studentId: string) => {
    await activateMutation.mutateAsync(studentId);
  };

  const handleDeactivate = async (studentId: string) => {
    await deactivateMutation.mutateAsync(studentId);
  };

  if (isLoading) {
    return <StudentsListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading students: {error.message}
      </div>
    );
  }

  const students = data?.students || [];

  if (students.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No students found</EmptyTitle>
          <EmptyDescription>
            Create your first student to get started.
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
            <TableHead>Matric Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.matricNumber}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.department.name}</TableCell>
              <TableCell>{student.department.faculty.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>
                <Badge variant={student.isActive ? "default" : "outline"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {student.isActive ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeactivate(student.id)}
                      disabled={deactivateMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleActivate(student.id)}
                      disabled={activateMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <StudentFormDialog
                    student={student}
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setStudentToDelete(student)}
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
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{studentToDelete?.name}"? This
              action cannot be undone.
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

function StudentsListSkeleton() {
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
