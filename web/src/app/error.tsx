"use client";

import { BrandLogo } from "@/components/common/brand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowCounterClockwiseIcon,
  BugIcon,
  HouseIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Error boundary caught:", error);
  }, [error]);

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
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <div className="bg-destructive/10 flex h-32 w-32 items-center justify-center rounded-full">
              <BugIcon
                size={64}
                weight="duotone"
                className="text-destructive animate-bounce"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold md:text-4xl">
                Oops! Something Went Wrong
              </h1>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                A wild bug appeared! Don't worry, these things happen. You can
                try again or return home while we investigate the issue.
              </p>
            </div>

            {error.message && (
              <Alert variant="destructive" className="max-w-2xl text-left">
                <AlertDescription className="text-sm">
                  <details className="cursor-pointer">
                    <summary className="font-medium hover:underline">
                      Technical details
                    </summary>
                    <p className="text-muted-foreground mt-2 wrap-break-words font-mono text-xs">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </details>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={reset} className="min-w-40">
                Try Again
              </Button>
              <Link href="/">
                <Button size="lg" variant="outline" className="min-w-40">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="border-t bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h3 className="mb-8 text-center text-xl font-semibold">
              What would you like to do?
            </h3>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
              <button
                onClick={reset}
                className="text-left transition-all hover:scale-105"
              >
                <Card className="hover:border-primary group h-full transition-all">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <ArrowCounterClockwiseIcon
                        size={24}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                    <h4 className="font-semibold">Try Again</h4>
                    <p className="text-muted-foreground text-sm">
                      Reload and try the action again
                    </p>
                  </CardContent>
                </Card>
              </button>

              <Link href="/">
                <Card className="hover:border-primary group h-full transition-all">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <HouseIcon
                        size={24}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                    <h4 className="font-semibold">Go Home</h4>
                    <p className="text-muted-foreground text-sm">
                      Return to the homepage
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/help">
                <Card className="hover:border-primary group h-full transition-all">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <QuestionIcon
                        size={24}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                    <h4 className="font-semibold">Get Help</h4>
                    <p className="text-muted-foreground text-sm">
                      Contact support for assistance
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} SLIMS. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
