"use client";

import {
  CheckCircleIcon,
  CircleNotchIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { authClient } from "@/lib/auth-client";
import { mapAuthError } from "@/lib/auth-utils";

interface VerifyMagicLinkProps {
  token: string;
}

export function VerifyMagicLink({ token }: VerifyMagicLinkProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : "No verification token provided.",
  );
  const [countdown, setCountdown] = useState(3);

  const verifyMutation = useMutation<void, Error, string>({
    mutationFn: async (token: string) => {
      // Use Better Auth's built-in magic link verification with query parameter
      // According to Better Auth docs, we should pass token in query object
      const result = await authClient.magicLink.verify({ 
        query: {
          token,
          callbackURL: "/industry-supervisor/dashboard",
        }
      });
      
      if (result.error) {
        throw new Error(result.error.message || "Verification failed");
      }
    },
    onSuccess: () => {
      setErrorMessage(null);
      toast.success("Sign in successful!");
    },
    onError: (error) => {
      const message = mapAuthError(error);
      setErrorMessage(message);
      toast.error(message);
    },
  });

  // Separate effect for countdown and redirect
  useEffect(() => {
    if (!verifyMutation.isSuccess) return;

    let interval: NodeJS.Timeout | null = null;
    
    interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (interval) clearInterval(interval);
          router.push("/industry-supervisor/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verifyMutation.isSuccess, router]);

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (verifyMutation.isPending) {
    return (
      <AuthCard title="Verifying Magic Link" subtitle="Please wait...">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <CircleNotchIcon
            className="h-12 w-12 animate-spin text-primary"
            weight="bold"
          />
          <p className="text-sm text-muted-foreground">
            Verifying your magic link...
          </p>
        </div>
      </AuthCard>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <AuthCard title="Sign In Successful!" subtitle="Welcome back">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircleIcon
              className="h-12 w-12 text-primary"
              weight="duotone"
            />
            <p className="text-center text-sm text-muted-foreground">
              Redirecting to your dashboard in {countdown} second
              {countdown !== 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verification Failed" subtitle="Unable to sign you in">
      <div className="space-y-6">
        {errorMessage && <AuthAlert type="error" message={errorMessage} />}

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <XCircleIcon
            className="h-12 w-12 text-destructive"
            weight="duotone"
          />
        </div>

        <div className="space-y-3">
          <Link href="/auth/login/industry-supervisor" className="block">
            <AuthButton variant="default" size="lg">
              Request New Magic Link
            </AuthButton>
          </Link>
          <Link href="/auth" className="block">
            <AuthButton variant="outline" size="lg">
              Back to Sign In
            </AuthButton>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Magic links expire after 15 minutes and can only be used once.
        </p>
      </div>
    </AuthCard>
  );
}
