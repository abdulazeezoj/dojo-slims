import { BrandLogo } from "@/components/common/brand";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <BrandLogo />
      </div>
    </header>
  );
}
