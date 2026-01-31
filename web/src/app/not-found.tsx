import { BrandLogo } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpenIcon,
  CompassIcon,
  HouseIcon,
  QuestionIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
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
            <div className="bg-muted flex h-32 w-32 items-center justify-center rounded-full">
              <CompassIcon
                size={64}
                weight="duotone"
                className="text-primary animate-pulse"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-7xl font-bold text-primary md:text-8xl">
                404
              </h1>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Page Not Found
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                Looks like this page went on SIWES without leaving a logbook
                entry. The page you're looking for doesn't exist or has been
                moved.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/">
                <Button size="lg" className="min-w-40">
                  Go Home
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="min-w-40">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="border-t bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h3 className="mb-8 text-center text-xl font-semibold">
              What are you looking for?
            </h3>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
              <Link href="/">
                <Card className="hover:border-primary group transition-all">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <HouseIcon
                        size={24}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                    <h4 className="font-semibold">Home</h4>
                    <p className="text-muted-foreground text-sm">
                      Return to the homepage
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/help">
                <Card className="hover:border-primary group transition-all">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <QuestionIcon
                        size={24}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                    <h4 className="font-semibold">Help Center</h4>
                    <p className="text-muted-foreground text-sm">
                      Get support and answers
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/auth">
                <Card className="hover:border-primary group transition-all">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <BookOpenIcon
                        size={24}
                        weight="duotone"
                        className="text-primary"
                      />
                    </div>
                    <h4 className="font-semibold">Your Logbook</h4>
                    <p className="text-muted-foreground text-sm">
                      Access your digital logbook
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
