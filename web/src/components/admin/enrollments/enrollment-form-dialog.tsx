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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEnrollment } from "@/hooks/use-admin-enrollments";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { useAdminStudents } from "@/hooks/use-admin-students";

interface EnrollmentFormDialogProps {
  trigger?: React.ReactNode;
}

export function EnrollmentFormDialog({ trigger }: EnrollmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState("");

  const { data: sessionsData } = useAdminSessions();
  const { data: studentsData } = useAdminStudents();

  const sessions = sessionsData || [];
  const students = studentsData?.students || [];

  const createMutation = useCreateEnrollment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      sessionId,
      studentId,
    });

    setOpen(false);
    setSessionId("");
    setStudentId("");
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Enrollment
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Enrollment</DialogTitle>
          <DialogDescription>
            Enroll a student in a session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session">Session</Label>
              <Select value={sessionId} onValueChange={setSessionId} required>
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
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId} required>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.matricNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
