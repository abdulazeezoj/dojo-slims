import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | SIWES Logbook",
  description: "Login with your admin ID to access the admin portal",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Admin Login</h1>
    </div>
  );
}
