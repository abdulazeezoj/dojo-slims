import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Week Entry | School Supervisor Portal",
  description: "View full week entry and provide comment",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Full Week Entry</h1>
    </div>
  );
}
