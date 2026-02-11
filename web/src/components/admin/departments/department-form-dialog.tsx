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
  useCreateDepartment,
  useUpdateDepartment,
  useFaculties,
  type Department,
} from "@/hooks/use-admin-departments";

interface DepartmentFormDialogProps {
  department?: Department;
  trigger?: React.ReactNode;
}

export function DepartmentFormDialog({
  department,
  trigger,
}: DepartmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(department?.name || "");
  const [code, setCode] = useState(department?.code || "");
  const [facultyId, setFacultyId] = useState(department?.facultyId || "");

  const { data: faculties } = useFaculties();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (department) {
      await updateMutation.mutateAsync({
        id: department.id,
        data: { name, code, facultyId },
      });
    } else {
      await createMutation.mutateAsync({ name, code, facultyId });
    }

    setOpen(false);
    if (!department) {
      setName("");
      setCode("");
      setFacultyId("");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Create New Department"}
          </DialogTitle>
          <DialogDescription>
            {department
              ? "Update the department details below."
              : "Enter the details for the new department."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select value={facultyId} onValueChange={setFacultyId} required>
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties?.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Computer Science"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Department Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., CSC"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : department ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
