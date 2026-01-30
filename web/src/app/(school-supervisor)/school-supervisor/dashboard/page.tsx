import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | School Supervisor Portal",
  description: "View your assigned students and alerts",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">School Supervisor Dashboard</h1>
    </div>
  );
}
