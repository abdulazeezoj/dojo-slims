import { LogbookHeader } from "@/components/student/logbook/logbook-header";
import { LogbookWeeksTable } from "@/components/student/logbook/logbook-weeks-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Logbook",
  description:
    "Manage your weekly SIWES entries and track your training progress.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <LogbookHeader />
      <LogbookWeeksTable />
    </div>
  );
}
