import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users | SIWES Admin Portal",
  description: "Manage admin users",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Admin User Management</h1>
    </div>
  );
}
