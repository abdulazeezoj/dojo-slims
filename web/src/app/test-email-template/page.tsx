import { TestEmailTemplate } from "@/components/test-email-template";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Email Template",
  description: "Preview email templates with sample data",
};

export default function TestEmailTemplatePage() {
  return <TestEmailTemplate />;
}
