import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Enrollment | SIWES Admin Portal",
  description: "Manage session enrollment",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Session Enrollment Management</h1>
    </div>
  );
}
