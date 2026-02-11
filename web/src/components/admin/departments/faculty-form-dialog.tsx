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
  useCreateFaculty,
  useUpdateFaculty,
  type Faculty,
} from "@/hooks/use-admin-departments";

interface FacultyFormDialogProps {
  faculty?: Faculty;
  trigger?: React.ReactNode;
}

export function FacultyFormDialog({ faculty, trigger }: FacultyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(faculty?.name || "");
  const [code, setCode] = useState(faculty?.code || "");

  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (faculty) {
      await updateMutation.mutateAsync({
        id: faculty.id,
        data: { name, code },
      });
    } else {
      await createMutation.mutateAsync({ name, code });
    }

    setOpen(false);
    if (!faculty) {
      setName("");
      setCode("");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Faculty
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {faculty ? "Edit Faculty" : "Create New Faculty"}
          </DialogTitle>
          <DialogDescription>
            {faculty
              ? "Update the faculty details below."
              : "Enter the details for the new faculty."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Faculty Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Faculty of Engineering"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Faculty Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., ENG"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : faculty ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
