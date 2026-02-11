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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateStudent,
  useUpdateStudent,
  type Student,
} from "@/hooks/use-admin-students";
import { useDepartments } from "@/hooks/use-admin-departments";

interface StudentFormDialogProps {
  student?: Student;
  trigger?: React.ReactNode;
}

export function StudentFormDialog({ student, trigger }: StudentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [matricNumber, setMatricNumber] = useState(student?.matricNumber || "");
  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [departmentId, setDepartmentId] = useState(student?.departmentId || "");
  const [password, setPassword] = useState("");

  const { data: departmentsData } = useDepartments();
  const departments = departmentsData || [];
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (student) {
      await updateMutation.mutateAsync({
        id: student.id,
        data: { name, email, departmentId },
      });
    } else {
      await createMutation.mutateAsync({
        matricNumber,
        name,
        email,
        departmentId,
        password,
      });
    }

    setOpen(false);
    if (!student) {
      setMatricNumber("");
      setName("");
      setEmail("");
      setDepartmentId("");
      setPassword("");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Student
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {student ? "Edit Student" : "Create New Student"}
          </DialogTitle>
          <DialogDescription>
            {student
              ? "Update the student details below."
              : "Enter the details for the new student."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!student && (
              <div className="grid gap-2">
                <Label htmlFor="matricNumber">Matric Number</Label>
                <Input
                  id="matricNumber"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="e.g., CSC/2020/001"
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.faculty.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!student && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : student ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
