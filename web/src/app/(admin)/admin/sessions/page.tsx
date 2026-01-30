import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIWES Sessions | SIWES Admin Portal",
  description: "Manage SIWES sessions",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">SIWES Session Management</h1>
    </div>
  );
}
