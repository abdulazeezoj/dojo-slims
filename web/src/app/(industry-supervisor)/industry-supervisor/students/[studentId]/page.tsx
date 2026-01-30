import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Details | Industry Supervisor Portal",
  description: "View student details and weekly entries",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Student Details</h1>
    </div>
  );
}
