import { SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";

import { BrandLogo } from "@/components/common/brand";

export default function Loading() {
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
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full">
            <SpinnerGapIcon
              size={48}
              weight="bold"
              className="text-primary animate-spin"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Loading School Supervisor Portal
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we prepare your dashboard...
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground text-center text-sm">
            © {new Date().getFullYear()} SLIMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
