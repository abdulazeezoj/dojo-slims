"use client";

import * as React from "react";
import {
  useDashboardData,
  type SessionInfo,
} from "@/hooks/use-student-dashboard";

interface StudentSessionContextValue {
  activeSession: SessionInfo | null;
  sessions: SessionInfo[];
  isLoading: boolean;
  error: Error | null;
}

const StudentSessionContext =
  React.createContext<StudentSessionContextValue | null>(null);

export function StudentSessionProvider({
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
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession(): StudentSessionContextValue {
  const context = React.useContext(StudentSessionContext);
  if (!context) {
    throw new Error(
      "useStudentSession must be used within a StudentSessionProvider",
    );
  }
  return context;
}
