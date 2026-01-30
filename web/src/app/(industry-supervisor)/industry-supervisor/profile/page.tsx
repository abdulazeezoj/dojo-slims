import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Industry Supervisor Portal",
  description: "View and manage your profile",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Industry Supervisor Profile</h1>
    </div>
  );
}
