import { AuthFooter } from "@/components/auth/footer";
import { AuthHeader } from "@/components/auth/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SLIMS - Auth Portal",
    template: "%s | SLIMS",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
