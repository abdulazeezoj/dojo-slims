import {
  ArrowRightIcon,
  HouseIcon,
  ShieldWarningIcon,
  SignOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/common/brand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardUrl, getServerSession } from "@/lib/auth-server";
import type { UserType } from "@/lib/auth-types";

interface ForbiddenPageProps {
  searchParams: Promise<{
    userType?: string;
  }>;
}

const userTypeLabels: Record<UserType, string> = {
  ADMIN: "Administrator",
  STUDENT: "Student",
  SCHOOL_SUPERVISOR: "School Supervisor",
  INDUSTRY_SUPERVISOR: "Industry Supervisor",
};

export default async function ForbiddenPage({
  searchParams,
}: ForbiddenPageProps) {
  const params = await searchParams;
  const session = await getServerSession();
  const userType = (params.userType as UserType) || session?.user.userType;
  const dashboardUrl = userType ? await getDashboardUrl(userType) : "/";
  const userTypeLabel = userType ? userTypeLabels[userType] : "User";

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
              <ShieldWarningIcon
                size={64}
                weight="duotone"
                className="text-destructive animate-pulse"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold md:text-4xl">
                Access Forbidden
              </h1>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                You don&apos;t have permission to access this page. This area is
                restricted to specific user roles.
              </p>
            </div>

            {userType && (
              <Alert className="max-w-2xl">
                <AlertDescription className="text-sm">
                  <p className="font-medium">
                    You are currently signed in as:{" "}
                    <span className="text-primary">{userTypeLabel}</span>
                  </p>
                  <p className="text-muted-foreground mt-2">
                    This page is restricted to users with different permissions.
                    You can access your dashboard or sign out to switch
                    accounts.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              {userType && (
                <Link href={dashboardUrl}>
                  <Button size="lg" className="min-w-40">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
              <SignOutButton
                size="lg"
                variant={userType ? "outline" : "default"}
                className="min-w-40"
              />
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
              {userType && (
                <Link href={dashboardUrl}>
                  <Card className="hover:border-primary group h-full transition-all">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                        <ArrowRightIcon
                          size={24}
                          weight="duotone"
                          className="text-primary"
                        />
                      </div>
                      <h4 className="font-semibold">Go to Dashboard</h4>
                      <p className="text-muted-foreground text-sm">
                        Access your {userTypeLabel.toLowerCase()} dashboard
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}

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

              <Card className="hover:border-primary group h-full transition-all cursor-pointer">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                    <SignOutIcon
                      size={24}
                      weight="duotone"
                      className="text-primary"
                    />
                  </div>
                  <h4 className="font-semibold">Sign Out</h4>
                  <p className="text-muted-foreground text-sm">
                    Sign out and switch accounts
                  </p>
                  <SignOutButton variant="outline" className="mt-2" />
                </CardContent>
              </Card>
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
