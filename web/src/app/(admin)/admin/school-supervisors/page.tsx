import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Supervisors | SIWES Admin Portal",
  description: "Manage school supervisors with bulk upload",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">School Supervisor Management</h1>
    </div>
  );
}
