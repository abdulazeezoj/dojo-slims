import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { AuthCard } from "@/components/auth/auth-card";

import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to your SLIMS admin account",
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
        title="Admin Sign In"
        subtitle="Enter your admin credentials to access the system"
      >
        <AdminLoginForm />
      </AuthCard>
    </div>
  );
}
