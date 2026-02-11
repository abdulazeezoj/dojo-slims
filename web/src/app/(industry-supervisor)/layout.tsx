import { requireServerIndustrySupervisor } from "@/lib/auth-server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate industry supervisor access before rendering
  await requireServerIndustrySupervisor();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar will go here */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
