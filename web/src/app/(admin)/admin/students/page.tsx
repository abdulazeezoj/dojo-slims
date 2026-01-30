import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Students | SIWES Admin Portal",
  description: "Manage students with bulk upload",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Student Management</h1>
    </div>
  );
}
