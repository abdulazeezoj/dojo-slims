import {
  ProfileHeader,
  ProfileInfo,
  ProfileChangePasswordForm,
} from "@/components/school-supervisor/profile";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your account information.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <ProfileHeader />
      <ProfileInfo />
      <Separator />
      <ProfileChangePasswordForm />
    </div>
  );
}
