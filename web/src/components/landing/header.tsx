"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { BrandLogo } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#workflow", label: "How It Works" },
    { href: "#roles", label: "For Users" },
  ];

  return (
    <header className="border- sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          {/* Trigger */}
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <ListIcon weight="bold" className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            }
          />

          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-75 sm:w-87.5"
          >
            <SheetHeader className="flex-row items-center justify-between space-y-0">
              <SheetTitle className="text-left">
                <BrandLogo />
              </SheetTitle>

              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8c w-8c p-0"
                  >
                    <XIcon weight="bold" className="size-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                }
              />
            </SheetHeader>

            <div className="py-8 flex flex-col gap-6 px-4">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-4 py-3 text-base font-medium transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Separator />

              <div className="">
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  <Button size="lg" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
