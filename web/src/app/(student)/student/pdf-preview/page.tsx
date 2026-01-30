import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Preview | SIWES Logbook",
  description: "Preview and download your ITF-compliant logbook",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Generate PDF Logbook</h1>
    </div>
  );
}
