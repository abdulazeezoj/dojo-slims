import { StudentHeader } from "@/components/student/header";
import { StudentSidebar } from "@/components/student/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireServerStudent } from "@/lib/auth-server";
import { StudentSiwesSession } from "@/providers/student-siwes-session";

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
      <StudentSiwesSession>
        <StudentSidebar />
        <SidebarInset>
          <StudentHeader />

          <main className="flex-1">{children}</main>
        </SidebarInset>
      </StudentSiwesSession>
    </SidebarProvider>
  );
}
