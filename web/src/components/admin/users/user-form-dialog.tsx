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
  useCreateAdminUser,
  useUpdateAdminUser,
  type AdminUser,
} from "@/hooks/use-admin-users";

interface UserFormDialogProps {
  user?: AdminUser;
  trigger?: React.ReactNode;
}

export function UserFormDialog({ user, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [adminId, setAdminId] = useState(user?.adminId || "");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      await updateMutation.mutateAsync({
        id: user.id,
        data: { name, email },
      });
    } else {
      await createMutation.mutateAsync({
        adminId,
        name,
        email,
        password,
      });
    }

    setOpen(false);
    if (!user) {
      setAdminId("");
      setName("");
      setEmail("");
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
              New Admin User
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? "Edit Admin User" : "Create New Admin User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the admin user details below."
              : "Enter the details for the new admin user."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!user && (
              <div className="grid gap-2">
                <Label htmlFor="adminId">Admin ID</Label>
                <Input
                  id="adminId"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g., ADM001"
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
                placeholder="admin@example.com"
                required
              />
            </div>
            {!user && (
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
              {isLoading ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
