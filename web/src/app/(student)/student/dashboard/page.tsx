import {
  DashboardAlerts,
  DashboardHeader,
  DashboardPlacement,
  DashboardQuickActions,
  DashboardStats,
} from "@/components/student/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your SIWES progress, placement information, and important alerts.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <DashboardHeader />
      <DashboardAlerts />
      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardPlacement />
        <DashboardQuickActions />
      </div>
    </div>
  );
}
