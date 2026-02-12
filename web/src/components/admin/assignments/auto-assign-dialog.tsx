"use client";

import { useState } from "react";
import { Sparkle } from "@phosphor-icons/react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoAssign } from "@/hooks/use-admin-assignments";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { useDepartments } from "@/hooks/use-admin-departments";

interface AutoAssignDialogProps {
  trigger?: React.ReactNode;
}

export function AutoAssignDialog({ trigger }: AutoAssignDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { data: sessionsData } = useAdminSessions();
  const { data: departmentsData } = useDepartments();

  const sessions = sessionsData || [];
  const departments = departmentsData || [];

  const autoAssignMutation = useAutoAssign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await autoAssignMutation.mutateAsync({
      sessionId,
      departmentId: departmentId || undefined,
    });

    setOpen(false);
    setSessionId("");
    setDepartmentId("");
  };

  const isLoading = autoAssignMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button variant="outline">
              <Sparkle className="mr-2 h-4 w-4" />
              Auto Assign
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auto Assign Students</DialogTitle>
          <DialogDescription>
            Automatically assign students to supervisors based on department.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session">Session</Label>
              <Select value={sessionId} onValueChange={(value) => setSessionId(value || "")} required>
                <SelectTrigger id="session">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Select value={departmentId} onValueChange={(value) => setDepartmentId(value || "")}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.faculty.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Assigning..." : "Auto Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
