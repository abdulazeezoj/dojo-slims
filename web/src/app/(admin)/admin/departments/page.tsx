import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departments & Faculties | SIWES Admin Portal",
  description: "Manage departments and faculties",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Department & Faculty Management</h1>
    </div>
  );
}
