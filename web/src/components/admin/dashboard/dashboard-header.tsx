/**
 * @file dashboard-header.tsx
 * @description Admin dashboard header component
 */

export function DashboardHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Monitor system activity and manage SIWES sessions
      </p>
    </div>
  );
}
