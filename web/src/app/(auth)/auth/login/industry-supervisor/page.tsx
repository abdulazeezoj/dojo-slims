import { AuthCard } from "@/components/auth/auth-card";
import { IndustrySupervisorLoginForm } from "@/components/auth/industry-supervisor-login-form";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Industry Supervisor Login",
  description: "Sign in to your SLIMS industry supervisor account",
};

export default function Page() {
  return (
    <div className="space-y-4">
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" weight="bold" />
        Back to role selection
      </Link>

      <AuthCard
        title="Industry Supervisor Sign In"
        subtitle="Enter your email to receive a secure magic link"
      >
        <IndustrySupervisorLoginForm />
      </AuthCard>
    </div>
  );
}
