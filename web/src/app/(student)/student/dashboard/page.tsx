import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SIWES Logbook",
  description:
    "View your SIWES session details, alerts, and placement information",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
    </div>
  );
}
