"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  // Remove 'student' from segments as it's the base
  if (segments[0] === "student") {
    segments.shift();
  }

  const breadcrumbs: Array<{ label: string; href?: string }> = [];

  // Always start with Dashboard
  breadcrumbs.push({ label: "Dashboard", href: "/student/dashboard" });

  if (segments.length === 0 || segments[0] === "dashboard") {
    // On dashboard, just show Dashboard as current page
    return [{ label: "Dashboard" }];
  }

  // Map route segments to breadcrumb labels
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment === "logbook") {
      breadcrumbs.push({ label: "Logbook", href: "/student/logbook" });
    } else if (segment === "profile") {
      breadcrumbs.push({ label: "Profile" });
    } else if (segment === "siwes-details") {
      breadcrumbs.push({ label: "SIWES Details" });
    } else if (segment === "pdf-preview") {
      breadcrumbs.push({ label: "PDF Preview" });
    } else if (
      segments[i - 1] === "logbook" &&
      segment.match(/^[a-f0-9-]{36}$/)
    ) {
      // Week detail page (UUID pattern)
      breadcrumbs.push({ label: `Week Details` });
    }
  }

  return breadcrumbs;
}

export function StudentHeader() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                <BreadcrumbItem
                  className={index === 0 ? "hidden md:block" : ""}
                >
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
