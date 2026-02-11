"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  redirectTo?: string;
}

export function SignOutButton({
  variant = "outline",
  size = "default",
  className,
  children = "Sign Out",
  showIcon = false,
  redirectTo = "/auth",
}: SignOutButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push(redirectTo);
            router.refresh();
          },
          onError: (ctx) => {
            console.error("Sign out failed:", ctx.error);
            setIsPending(false);
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsPending(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isPending}
    >
      {showIcon && <SignOutIcon size={20} weight="duotone" className="mr-2" />}
      {isPending ? "Signing out..." : children}
    </Button>
  );
}
