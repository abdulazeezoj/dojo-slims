import { StudentHeader } from "@/components/student/header";
import { StudentSidebar } from "@/components/student/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireServerStudent } from "@/lib/auth-server";
import { ClientSessionProvider } from "@/components/student/client-session-provider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SLIMS - Student Dashboard",
    template: "%s | SLIMS",
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate student access before rendering
  await requireServerStudent();

  return (
    <SidebarProvider>
      <ClientSessionProvider>
        <StudentSidebar />
        <SidebarInset>
          <StudentHeader />

          <main className="flex-1">{children}</main>
        </SidebarInset>
      </ClientSessionProvider>
    </SidebarProvider>
  );
}
