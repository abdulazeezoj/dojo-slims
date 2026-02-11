import { ProfileHeader, ProfileInfo } from "@/components/student/profile";
import { ProfileChangePasswordForm } from "@/components/student/profile/profile-change-password-form";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "View your profile information and manage account settings.",
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
