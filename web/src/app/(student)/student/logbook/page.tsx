import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Logbook | SIWES Logbook",
  description: "View all your weekly entries",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Weekly Entries List</h1>
    </div>
  );
}
