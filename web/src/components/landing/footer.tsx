"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/common/brand";
import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <BrandLogo className="mb-4" />
            <p className="text-muted-foreground max-w-sm text-sm">
              Digital SIWES logbook platform for Ahmadu Bello University.
              Streamline industrial training supervision with verifiable digital
              records.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#workflow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#roles"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Users
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {currentYear} SLIMS. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Ahmadu Bello University, Zaria
          </p>
        </div>
      </div>
    </footer>
  );
}
