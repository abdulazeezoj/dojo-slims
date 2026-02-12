"use client";

import { StudentSiwesSessionProvider } from "@/contexts/student-siwes-session";

export function StudentSiwesSession({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentSiwesSessionProvider>{children}</StudentSiwesSessionProvider>;
}
