"use client";

import { StudentSessionProvider } from "@/contexts/student-session-context";

export function ClientSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentSessionProvider>{children}</StudentSessionProvider>;
}
