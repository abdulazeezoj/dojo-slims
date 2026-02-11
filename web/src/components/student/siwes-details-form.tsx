"use client";

import {
  BuildingsIcon,
  CalendarIcon,
  ClipboardTextIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOrganizations,
  useSaveSiwesDetails,
  useSiwesDetailsData,
} from "@/hooks/use-siwes-details";
import { siwesDetailSchema } from "@/schemas/siwes-detail";

export function SiwesDetailsFormSkeleton() {
  return (
    <>
      {/* Four large form section cards */}
      {[...Array(4)].map((_, cardIndex) => (
        <Card key={cardIndex}>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Button row */}
      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </>
  );
}

interface SiwesDetailsFormData {
  placementOrganizationId?: string;
  organizationName?: string;
  organizationAddress: string;
  organizationCity: string;
  organizationState: string;
  organizationPhone: string;
  organizationEmail?: string;
  industrySupervisorName: string;
  industrySupervisorEmail: string;
  industrySupervisorPosition?: string;
  industrySupervisorPhone: string;
  trainingStartDate: Date;
  trainingEndDate: Date;
  jobTitle?: string;
  departmentAtOrg?: string;
  programOfStudy: string;
  level: string;
  session: string;
  trainingDuration: string;
  areaOfSpecialization?: string;
}

export function SiwesDetailsForm() {
  const router = useRouter();
  const { data: existingDetails } = useSiwesDetailsData();
  const { data: organizations } = useOrganizations();
  const saveMutation = useSaveSiwesDetails();

  const form = useForm({
    defaultValues: existingDetails || {
      placementOrganizationId: "",
      organizationName: "",
      organizationAddress: "",
      organizationCity: "",
      organizationState: "",
      organizationPhone: "",
      organizationEmail: "",
      industrySupervisorName: "",
      industrySupervisorEmail: "",
      industrySupervisorPosition: "",
      industrySupervisorPhone: "",
      trainingStartDate: new Date(),
      trainingEndDate: new Date(),
      jobTitle: "",
      departmentAtOrg: "",
      programOfStudy: "",
      level: "",
      session: "",
      trainingDuration: "",
      areaOfSpecialization: "",
    },
    onSubmit: async ({ value }) => {
      const result = siwesDetailSchema.safeParse(value);
      if (!result.success) {
        toast.error(result.error.issues[0]?.message || "Validation failed");
        return;
      }
      saveMutation.mutate(value as SiwesDetailsFormData);
    },
  });

  const handleOrganizationSelect = (orgId: string | null) => {
    if (!orgId) {
      return;
    }
    const org = organizations?.find((o) => o.id === orgId);
    if (org) {
      form.setFieldValue("placementOrganizationId", org.id);
      form.setFieldValue("organizationName", org.name);
      form.setFieldValue("organizationAddress", org.address);
      form.setFieldValue("organizationCity", org.city);
      form.setFieldValue("organizationState", org.state);
      form.setFieldValue("organizationPhone", org.phone);
      form.setFieldValue("organizationEmail", org.email || "");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Placement Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingsIcon className="h-5 w-5" />
            Placement Organization
          </CardTitle>
          <CardDescription>
            Select an existing organization or enter new details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizations && organizations.length > 0 && (
            <div className="space-y-2">
              <Label>Select Organization (Optional)</Label>
              <Select onValueChange={handleOrganizationSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose from existing organizations" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="organizationName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Organization Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Enter organization name"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="organizationPhone">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="+2348012345678"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="organizationAddress">
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Street address"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="organizationCity">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="City"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="organizationState">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="State"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="organizationEmail">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email (Optional)</Label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="organization@example.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Industry Supervisor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Industry Supervisor
          </CardTitle>
          <CardDescription>
            Your supervisor at the placement organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="industrySupervisorName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Enter supervisor's name"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="industrySupervisorEmail">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="supervisor@example.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="industrySupervisorPhone">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="+2348012345678"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="industrySupervisorPosition">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Position (Optional)</Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Senior Engineer"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Training Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Training Details
          </CardTitle>
          <CardDescription>Your training period and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="trainingStartDate">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={
                      field.state.value instanceof Date
                        ? field.state.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      field.handleChange(new Date(e.target.value))
                    }
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="trainingEndDate">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={
                      field.state.value instanceof Date
                        ? field.state.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      field.handleChange(new Date(e.target.value))
                    }
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="jobTitle">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Job Title (Optional)</Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., IT Intern"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="departmentAtOrg">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Department (Optional)</Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., IT Department"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Logbook Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardTextIcon className="h-5 w-5" />
            Logbook Information
          </CardTitle>
          <CardDescription>
            Academic details for ITF logbook compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="programOfStudy">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Program of Study <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Computer Science"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="level">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="session">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Session <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., 2025/2026"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="trainingDuration">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Training Duration{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., 6 months"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="areaOfSpecialization">
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>
                    Area of Specialization (Optional)
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Software Development"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Details"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
