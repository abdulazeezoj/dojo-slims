import { TestError } from "@/components/test-error";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Error",
  description: "Test page for error boundary functionality",
};

export default function TestErrorPage() {
  return <TestError />;
}
