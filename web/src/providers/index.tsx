"use client";

import { QueryProvider } from "./query-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers wrapper for the application
 */
export function Providers({ children }: ProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
