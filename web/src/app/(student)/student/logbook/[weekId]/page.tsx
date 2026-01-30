import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Entry | SIWES Logbook",
  description: "View and edit your weekly entry",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Weekly Entry Detail</h1>
    </div>
  );
}
