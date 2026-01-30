import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placement Organizations | SIWES Admin Portal",
  description: "Manage placement organizations",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Placement Organization Management</h1>
    </div>
  );
}
