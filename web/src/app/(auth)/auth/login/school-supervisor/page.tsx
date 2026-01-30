import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Supervisor Login | SIWES Logbook",
  description: "Login with your staff ID to access the supervision portal",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">School Supervisor Login</h1>
    </div>
  );
}
