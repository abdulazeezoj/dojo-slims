"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateSession,
  useUpdateSession,
  type Session,
} from "@/hooks/use-admin-sessions";

interface SessionFormDialogProps {
  session?: Session;
  trigger?: React.ReactNode;
}

export function SessionFormDialog({ session, trigger }: SessionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(session?.name || "");
  const [startDate, setStartDate] = useState(
    session?.startDate
      ? new Date(session.startDate).toISOString().split("T")[0]
      : "",
  );
  const [endDate, setEndDate] = useState(
    session?.endDate
      ? new Date(session.endDate).toISOString().split("T")[0]
      : "",
  );
  const [totalWeeks, setTotalWeeks] = useState(
    session?.totalWeeks?.toString() || "24",
  );

  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalWeeks: parseInt(totalWeeks),
    };

    if (session) {
      await updateMutation.mutateAsync({ id: session.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }

    setOpen(false);
    if (!session) {
      setName("");
      setStartDate("");
      setEndDate("");
      setTotalWeeks("24");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {session ? "Edit Session" : "Create New Session"}
          </DialogTitle>
          <DialogDescription>
            {session
              ? "Update the session details below."
              : "Enter the details for the new SIWES session."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Session Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 2023/2024 Session"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalWeeks">Total Weeks</Label>
              <Input
                id="totalWeeks"
                type="number"
                min="1"
                max="52"
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : session ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
