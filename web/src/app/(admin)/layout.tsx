import { requireServerAdmin } from "@/lib/auth-server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate admin access before rendering
  await requireServerAdmin();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar will go here */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
