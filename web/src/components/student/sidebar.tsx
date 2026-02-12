"use client";

import {
  BookOpenIcon,
  ClipboardTextIcon,
  FilePdfIcon,
  HouseIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { useSession } from "@/hooks/use-session";
import { BrandLogo } from "../common/brand";
import { NavMain } from "./nav-main";
import { NavUser, NavUserError, NavUserSkeleton } from "./nav-user";

const navItems = [
  {
    title: "Dashboard",
    url: "/student/dashboard",
    icon: HouseIcon,
  },
  {
    title: "My Logbook",
    url: "/student/logbook",
    icon: BookOpenIcon,
  },
  {
    title: "SIWES Details",
    url: "/student/siwes-details",
    icon: ClipboardTextIcon,
  },
  {
    title: "PDF Preview",
    url: "/student/pdf-preview",
    icon: FilePdfIcon,
  },
  {
    title: "Profile",
    url: "/student/profile",
    icon: UserIcon,
  },
];

export function StudentSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  const pathname = usePathname();

  // Get user info from session or use defaults
  const user = {
    name:
      ((session.data as any)?.user as any)?.name ||
      session.username ||
      "Student",
    email: session.email || "student@example.com",
    avatar: ((session.data as any)?.user as any)?.image || "",
  };

  // Compute navigation items with active state based on current pathname
  const navMainWithActive = React.useMemo(() => {
    return navItems.map((item) => ({
      ...item,
      isActive: pathname === item.url,
    }));
  }, [pathname]);

  // Render appropriate NavUser state based on session status
  const renderNavUser = () => {
    if (session.isPending || session.isRefetching) {
      return <NavUserSkeleton />;
    }

    if (session.error) {
      return <NavUserError onRefetch={session.refetch} />;
    }

    return <NavUser user={user} />;
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        {/* <div className="flex h-16 items-center px-4"> */}
        <BrandLogo href="/student/dashboard" />
        {/* </div> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
      </SidebarContent>
      <SidebarFooter>{renderNavUser()}</SidebarFooter>
    </Sidebar>
  );
}
