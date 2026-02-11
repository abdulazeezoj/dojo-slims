"use client";

import {
  ArrowCounterClockwiseIcon,
  HouseIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { BrandLogo } from "@/components/common/brand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Determine error type for better messaging
  const isAuthError =
    error.message.toLowerCase().includes("unauthorized") ||
    error.message.toLowerCase().includes("authentication");
  const isSessionError = error.message.toLowerCase().includes("session");
  const isEnrollmentError =
    error.message.toLowerCase().includes("enrollment") ||
    error.message.toLowerCase().includes("not enrolled");
  const isWeekLockedError = error.message.toLowerCase().includes("locked");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <BrandLogo />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
            <div className="bg-destructive/10 flex h-32 w-32 items-center justify-center rounded-full">
              <WarningCircleIcon
                size={64}
                weight="duotone"
                className="text-destructive animate-bounce"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold md:text-4xl">
                {isAuthError
                  ? "Access Denied"
                  : isSessionError
                    ? "Session Error"
                    : isEnrollmentError
                      ? "Enrollment Required"
                      : isWeekLockedError
                        ? "Week Locked"
                        : "Oops! Something Went Wrong"}
              </h1>

              <p className="text-muted-foreground text-lg">
                {isAuthError
                  ? "You don't have permission to access this resource. Please sign in again or contact support if the issue persists."
                  : isSessionError
                    ? "There was a problem with your SIWES session. Please refresh the page or return to the dashboard."
                    : isEnrollmentError
                      ? "You need to be enrolled in a SIWES session to access this page. Please contact your administrator."
                      : isWeekLockedError
                        ? "This week has been locked by your supervisor and cannot be edited. Contact your supervisor if you need to make changes."
                        : "We encountered an unexpected error while loading your dashboard. This could be a temporary issue."}
              </p>
            </div>

            {/* Error Details */}
            <Card className="w-full">
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  <AlertDescription className="font-mono text-sm">
                    {error.message || "Unknown error occurred"}
                  </AlertDescription>
                </Alert>
                {error.digest && (
                  <p className="text-muted-foreground mt-4 text-xs">
                    Error ID: {error.digest}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={reset} className="gap-2">
                <ArrowCounterClockwiseIcon className="h-5 w-5" weight="bold" />
                Try Again
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                render={
                  <Link href="/student/dashboard">
                    <HouseIcon className="h-5 w-5" weight="bold" />
                    Return to Dashboard
                  </Link>
                }
              />
            </div>

            {/* Help Text */}
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>If this problem continues:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Contact your school supervisor or system administrator</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} SLIMS. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <Link
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
