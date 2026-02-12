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
import { useCreateAssignment } from "@/hooks/use-admin-assignments";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { useAdminStudents } from "@/hooks/use-admin-students";
import { useAdminSchoolSupervisors } from "@/hooks/use-admin-school-supervisors";

interface AssignmentFormDialogProps {
  trigger?: React.ReactNode;
}

export function AssignmentFormDialog({ trigger }: AssignmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [schoolSupervisorId, setSchoolSupervisorId] = useState("");

  const { data: sessionsData } = useAdminSessions();
  const { data: studentsData } = useAdminStudents();
  const { data: supervisorsData } = useAdminSchoolSupervisors();

  const sessions = sessionsData || [];
  const students = studentsData?.students || [];
  const supervisors = supervisorsData?.schoolSupervisors || [];

  const createMutation = useCreateAssignment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      sessionId,
      studentId,
      schoolSupervisorId,
    });

    setOpen(false);
    setSessionId("");
    setStudentId("");
    setSchoolSupervisorId("");
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
              New Assignment
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Assign a student to a school supervisor for a session.
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
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={(value) => setStudentId(value || "")} required>
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
            <div className="grid gap-2">
              <Label htmlFor="supervisor">School Supervisor</Label>
              <Select value={schoolSupervisorId} onValueChange={(value) => setSchoolSupervisorId(value || "")} required>
                <SelectTrigger id="supervisor">
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} ({supervisor.staffId})
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
