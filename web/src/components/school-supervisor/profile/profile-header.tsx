/**
 * @file profile-header.tsx
 * @description Profile page header
 */

"use client";

import { UserCircleIcon } from "@phosphor-icons/react";

export function ProfileHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8" />
          Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </div>
    </div>
  );
}
