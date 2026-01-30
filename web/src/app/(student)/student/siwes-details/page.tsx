import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIWES Details | SIWES Logbook",
  description: "Enter your SIWES placement and industry supervisor details",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">SIWES Details Entry</h1>
    </div>
  );
}
