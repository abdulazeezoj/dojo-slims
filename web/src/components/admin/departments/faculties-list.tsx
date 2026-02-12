"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon } from "@phosphor-icons/react";
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
  useFaculties,
  useDeleteFaculty,
  type Faculty,
} from "@/hooks/use-admin-departments";
import { FacultyFormDialog } from "./faculty-form-dialog";

export function FacultiesList() {
  const { data: faculties, isLoading, error } = useFaculties();
  const deleteMutation = useDeleteFaculty();
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);

  const handleDelete = async () => {
    if (facultyToDelete) {
      await deleteMutation.mutateAsync(facultyToDelete.id);
      setFacultyToDelete(null);
    }
  };

  if (isLoading) {
    return <FacultiesListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading faculties: {error.message}
      </div>
    );
  }

  if (!faculties || faculties.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No faculties found</EmptyTitle>
          <EmptyDescription>
            Create your first faculty to get started.
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
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faculties.map((faculty) => (
            <TableRow key={faculty.id}>
              <TableCell className="font-medium">{faculty.name}</TableCell>
              <TableCell>{faculty.code}</TableCell>
              <TableCell>
                {format(new Date(faculty.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <FacultyFormDialog
                    faculty={faculty}
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setFacultyToDelete(faculty)}
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
        open={!!facultyToDelete}
        onOpenChange={(open) => !open && setFacultyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{facultyToDelete?.name}"? This
              will also delete all associated departments. This action cannot be
              undone.
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

function FacultiesListSkeleton() {
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
