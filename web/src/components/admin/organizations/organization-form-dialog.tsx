"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
  useCreateOrganization,
  useUpdateOrganization,
  type Organization,
} from "@/hooks/use-admin-organizations";

interface OrganizationFormDialogProps {
  organization?: Organization;
  trigger?: React.ReactNode;
}

export function OrganizationFormDialog({
  organization,
  trigger,
}: OrganizationFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(organization?.name || "");
  const [address, setAddress] = useState(organization?.address || "");
  const [city, setCity] = useState(organization?.city || "");
  const [state, setState] = useState(organization?.state || "");
  const [phone, setPhone] = useState(organization?.phone || "");
  const [email, setEmail] = useState(organization?.email || "");

  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      address,
      city,
      state,
      phone,
      email: email || undefined,
    };

    if (organization) {
      await updateMutation.mutateAsync({
        id: organization.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }

    setOpen(false);
    if (!organization) {
      setName("");
      setAddress("");
      setCity("");
      setState("");
      setPhone("");
      setEmail("");
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
              New Organization
            </Button>
          }
        />
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {organization ? "Edit Organization" : "Create New Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Update the organization details below."
              : "Enter the details for the new organization."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tech Solutions Ltd"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main Street"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Lagos"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., Lagos"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +234 xxx xxx xxxx"
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
                placeholder="e.g., info@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : organization
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
