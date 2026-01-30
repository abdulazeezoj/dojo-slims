import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industry Supervisor Login | SIWES Logbook",
  description: "Request a magic link to access the supervision portal",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Industry Supervisor Login</h1>
    </div>
  );
}
