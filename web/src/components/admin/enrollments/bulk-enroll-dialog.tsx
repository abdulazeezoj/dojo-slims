"use client";

import { useState } from "react";
import { Users } from "@phosphor-icons/react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBulkEnroll } from "@/hooks/use-admin-enrollments";
import { useAdminSessions } from "@/hooks/use-admin-sessions";
import { useAdminStudents } from "@/hooks/use-admin-students";

interface BulkEnrollDialogProps {
  trigger?: React.ReactNode;
}

export function BulkEnrollDialog({ trigger }: BulkEnrollDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: sessionsData } = useAdminSessions();
  const { data: studentsData } = useAdminStudents();

  const sessions = sessionsData || [];
  const students = studentsData?.students || [];

  const bulkEnrollMutation = useBulkEnroll();

  const handleToggleStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await bulkEnrollMutation.mutateAsync({
      sessionId,
      studentIds: selectedStudents,
    });

    setOpen(false);
    setSessionId("");
    setSelectedStudents([]);
  };

  const isLoading = bulkEnrollMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Bulk Enroll
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Enroll Students</DialogTitle>
          <DialogDescription>
            Select a session and students to enroll.
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
              <div className="flex items-center justify-between">
                <Label>Students</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedStudents.length === students.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students available</p>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) =>
                          handleToggleStudent(student.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={student.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {student.name} ({student.matricNumber})
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedStudents.length} student(s) selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || selectedStudents.length === 0}>
              {isLoading ? "Enrolling..." : `Enroll ${selectedStudents.length} Student(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
