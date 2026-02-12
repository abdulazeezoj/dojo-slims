"use client";

import { UserIcon } from "@phosphor-icons/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileData } from "@/hooks/use-school-supervisor-profile";

export function ProfileInfo() {
  const { data: profile, isLoading, error } = useProfileData();

  if (isLoading) {
    return <ProfileInfoSkeleton />;
  }

  if (error) {
    // Critical data - bubble to error boundary
    throw error;
  }

  if (!profile) {
    // Should not happen but TypeScript safety
    throw new Error("Profile data not available");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Full Name</Label>
            <p className="font-medium">{profile.name}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Email</Label>
            <p className="font-medium">{profile.email}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Staff ID</Label>
            <p className="font-medium">{profile.staffId}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Department</Label>
            <p className="font-medium">{profile.department}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Faculty</Label>
            <p className="font-medium">{profile.faculty}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileInfoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
