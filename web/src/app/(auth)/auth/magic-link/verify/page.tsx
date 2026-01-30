import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Magic Link | SIWES Logbook",
  description: "Verifying your magic link access",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Verify Magic Link</h1>
    </div>
  );
}
