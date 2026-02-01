import { VerifyMagicLink } from "@/components/auth/verify-magic-link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Magic Link",
  description: "Verifying your magic link access",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token || "";

  return <VerifyMagicLink token={token} />;
}
