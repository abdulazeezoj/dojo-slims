import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignments | SIWES Admin Portal",
  description: "Manage student-supervisor assignments",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Student-Supervisor Assignment</h1>
    </div>
  );
}
