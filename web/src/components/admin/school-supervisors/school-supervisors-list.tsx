"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon, CheckCircle, XCircle } from "@phosphor-icons/react";

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
  useAdminSchoolSupervisors,
  useDeleteSchoolSupervisor,
  useActivateSchoolSupervisor,
  useDeactivateSchoolSupervisor,
  type SchoolSupervisor,
} from "@/hooks/use-admin-school-supervisors";
import { SchoolSupervisorFormDialog } from "./school-supervisor-form-dialog";

export function SchoolSupervisorsList() {
  const { data, isLoading, error } = useAdminSchoolSupervisors();
  const deleteMutation = useDeleteSchoolSupervisor();
  const activateMutation = useActivateSchoolSupervisor();
  const deactivateMutation = useDeactivateSchoolSupervisor();
  const [supervisorToDelete, setSupervisorToDelete] = useState<SchoolSupervisor | null>(null);

  const handleDelete = async () => {
    if (supervisorToDelete) {
      await deleteMutation.mutateAsync(supervisorToDelete.id);
      setSupervisorToDelete(null);
    }
  };

  const handleActivate = async (supervisorId: string) => {
    await activateMutation.mutateAsync(supervisorId);
  };

  const handleDeactivate = async (supervisorId: string) => {
    await deactivateMutation.mutateAsync(supervisorId);
  };

  if (isLoading) {
    return <SchoolSupervisorsListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading school supervisors: {error.message}
      </div>
    );
  }

  const supervisors = data?.schoolSupervisors || [];

  if (supervisors.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No school supervisors found</EmptyTitle>
          <EmptyDescription>
            Create your first school supervisor to get started.
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
            <TableHead>Staff ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supervisors.map((supervisor) => (
            <TableRow key={supervisor.id}>
              <TableCell className="font-medium">{supervisor.staffId}</TableCell>
              <TableCell>{supervisor.name}</TableCell>
              <TableCell>{supervisor.department.name}</TableCell>
              <TableCell>{supervisor.department.faculty.name}</TableCell>
              <TableCell>{supervisor.email}</TableCell>
              <TableCell>
                <Badge variant={supervisor.isActive ? "default" : "outline"}>
                  {supervisor.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {supervisor.isActive ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeactivate(supervisor.id)}
                      disabled={deactivateMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleActivate(supervisor.id)}
                      disabled={activateMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <SchoolSupervisorFormDialog
                    supervisor={supervisor}
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSupervisorToDelete(supervisor)}
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
        open={!!supervisorToDelete}
        onOpenChange={(open) => !open && setSupervisorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School Supervisor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{supervisorToDelete?.name}"? This
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

function SchoolSupervisorsListSkeleton() {
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
