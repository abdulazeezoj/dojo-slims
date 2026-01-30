import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Students | School Supervisor Portal",
  description: "View all your assigned students",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Students List</h1>
    </div>
  );
}
