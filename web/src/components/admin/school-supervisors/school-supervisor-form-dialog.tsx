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
  useCreateSchoolSupervisor,
  useUpdateSchoolSupervisor,
  type SchoolSupervisor,
} from "@/hooks/use-admin-school-supervisors";
import { useDepartments } from "@/hooks/use-admin-departments";

interface SchoolSupervisorFormDialogProps {
  supervisor?: SchoolSupervisor;
  trigger?: React.ReactNode;
}

export function SchoolSupervisorFormDialog({ supervisor, trigger }: SchoolSupervisorFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [staffId, setStaffId] = useState(supervisor?.staffId || "");
  const [name, setName] = useState(supervisor?.name || "");
  const [email, setEmail] = useState(supervisor?.email || "");
  const [departmentId, setDepartmentId] = useState(supervisor?.departmentId || "");
  const [password, setPassword] = useState("");

  const { data: departmentsData } = useDepartments();
  const departments = departmentsData || [];
  const createMutation = useCreateSchoolSupervisor();
  const updateMutation = useUpdateSchoolSupervisor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (supervisor) {
      await updateMutation.mutateAsync({
        id: supervisor.id,
        data: { name, email, departmentId },
      });
    } else {
      await createMutation.mutateAsync({
        staffId,
        name,
        email,
        departmentId,
        password,
      });
    }

    setOpen(false);
    if (!supervisor) {
      setStaffId("");
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
              New Supervisor
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {supervisor ? "Edit School Supervisor" : "Create New School Supervisor"}
          </DialogTitle>
          <DialogDescription>
            {supervisor
              ? "Update the school supervisor details below."
              : "Enter the details for the new school supervisor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!supervisor && (
              <div className="grid gap-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="e.g., STAFF001"
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
                placeholder="supervisor@example.com"
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
            {!supervisor && (
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
              {isLoading ? "Saving..." : supervisor ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
