"use client";

import { format } from "date-fns";
import { PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteOrganization,
  useOrganizations,
  type Organization,
} from "@/hooks/use-admin-organizations";
import { OrganizationFormDialog } from "./organization-form-dialog";

export function OrganizationsList() {
  const { data, isLoading, error } = useOrganizations();
  const deleteMutation = useDeleteOrganization();
  const [organizationToDelete, setOrganizationToDelete] =
    useState<Organization | null>(null);

  const handleDelete = async () => {
    if (organizationToDelete) {
      await deleteMutation.mutateAsync(organizationToDelete.id);
      setOrganizationToDelete(null);
    }
  };

  if (isLoading) {
    return <OrganizationsListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading organizations: {error.message}
      </div>
    );
  }

  if (!data?.organizations || data.organizations.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No organizations found</EmptyTitle>
          <EmptyDescription>
            Create your first organization to get started.
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
            <TableHead>Address</TableHead>
            <TableHead>City/State</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.organizations.map((organization) => (
            <TableRow key={organization.id}>
              <TableCell className="font-medium">{organization.name}</TableCell>
              <TableCell>{organization.address}</TableCell>
              <TableCell>
                {organization.city}, {organization.state}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{organization.phone}</div>
                  {organization.email && (
                    <div className="text-muted-foreground">
                      {organization.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(organization.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <OrganizationFormDialog
                    organization={organization}
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setOrganizationToDelete(organization)}
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
        open={!!organizationToDelete}
        onOpenChange={(open) => !open && setOrganizationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{organizationToDelete?.name}&quot;?
              This action cannot be undone.
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

function OrganizationsListSkeleton() {
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
