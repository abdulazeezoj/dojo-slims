import { AuthFooter } from "@/components/auth/footer";
import { AuthHeader } from "@/components/auth/header";
import { getDashboardUrl, getServerSession } from "@/lib/auth-server";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "SLIMS - Auth Portal",
    template: "%s | SLIMS",
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect authenticated users to their dashboard
  const session = await getServerSession();

  if (session) {
    const dashboardUrl = await getDashboardUrl(session.user.userType);
    redirect(dashboardUrl);
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
