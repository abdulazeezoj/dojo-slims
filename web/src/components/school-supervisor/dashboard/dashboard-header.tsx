/**
 * @file dashboard-header.tsx
 * @description Dashboard header with greeting
 */

"use client";

import { GraduationCapIcon } from "@phosphor-icons/react";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCapIcon className="h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor your assigned students and their progress
        </p>
      </div>
    </div>
  );
}
