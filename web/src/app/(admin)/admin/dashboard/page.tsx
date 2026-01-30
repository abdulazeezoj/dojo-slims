import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SIWES Admin Portal",
  description: "View system statistics and recent activities",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    </div>
  );
}
