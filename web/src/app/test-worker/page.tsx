import { TestWorker } from "@/components/test-worker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Worker",
  description: "Test BullMQ workers and background tasks",
};

export default function TestWorkerPage() {
  return <TestWorker />;
}
