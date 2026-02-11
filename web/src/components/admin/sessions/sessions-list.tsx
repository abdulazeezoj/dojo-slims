"use client";

import { useState } from "react";
import { PencilIcon, StopCircleIcon, TrashIcon } from "@phosphor-icons/react";
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
import { Empty } from "@/components/ui/empty";
import {
  useAdminSessions,
  useCloseSession,
  type Session,
} from "@/hooks/use-admin-sessions";
import { SessionFormDialog } from "./session-form-dialog";

export function SessionsList() {
  const { data: sessions, isLoading, error } = useAdminSessions();
  const closeMutation = useCloseSession();
  const [sessionToClose, setSessionToClose] = useState<Session | null>(null);

  const handleClose = async () => {
    if (sessionToClose) {
      await closeMutation.mutateAsync(sessionToClose.id);
      setSessionToClose(null);
    }
  };

  if (isLoading) {
    return <SessionsListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading sessions: {error.message}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Empty
        title="No sessions found"
        description="Create your first SIWES session to get started."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Total Weeks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">{session.name}</TableCell>
              <TableCell>
                {format(new Date(session.startDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {format(new Date(session.endDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{session.totalWeeks}</TableCell>
              <TableCell>
                <Badge
                  variant={session.status === "ACTIVE" ? "default" : "outline"}
                >
                  {session.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <SessionFormDialog
                    session={session}
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  {session.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSessionToClose(session)}
                    >
                      <StopCircleIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!sessionToClose}
        onOpenChange={(open) => !open && setSessionToClose(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close "{sessionToClose?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>
              Close Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SessionsListSkeleton() {
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
