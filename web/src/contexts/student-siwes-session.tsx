"use client";

import * as React from "react";
import {
  useDashboardData,
  type SessionInfo,
} from "@/hooks/use-student-dashboard";

interface StudentSiwesSessionContextValue {
  activeSession: SessionInfo | null;
  sessions: SessionInfo[];
  isLoading: boolean;
  error: Error | null;
}

const StudentSiwesSessionContext =
  React.createContext<StudentSiwesSessionContextValue | null>(null);

export function StudentSiwesSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, error } = useDashboardData();

  const value = React.useMemo(
    () => ({
      activeSession: data?.activeSession ?? null,
      sessions: data?.sessions ?? [],
      isLoading,
      error: error as Error | null,
    }),
    [data?.activeSession, data?.sessions, isLoading, error],
  );

  return (
    <StudentSiwesSessionContext.Provider value={value}>
      {children}
    </StudentSiwesSessionContext.Provider>
  );
}

export function useStudentSiwesSession(): StudentSiwesSessionContextValue {
  const context = React.useContext(StudentSiwesSessionContext);
  if (!context) {
    throw new Error(
      "useStudentSiwesSession must be used within a StudentSiwesSessionProvider",
    );
  }
  return context;
}
