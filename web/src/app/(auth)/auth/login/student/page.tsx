import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Login | SIWES Logbook",
  description: "Login with your matric number to access your SIWES logbook",
};

export default function Page() {
  return (
    <div className="flex min-h-100 items-center justify-center">
      <h1 className="text-2xl font-bold">Student Login</h1>
    </div>
  );
}
