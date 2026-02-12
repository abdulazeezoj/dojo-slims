import {
  DashboardAlerts,
  DashboardHeader,
  DashboardStats,
  DashboardStudents,
} from "@/components/school-supervisor/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your assigned students and track their progress.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <DashboardHeader />
      <DashboardAlerts />
      <DashboardStats />
      <DashboardStudents />
    </div>
  );
}
