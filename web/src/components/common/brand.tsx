"use client";

import { BookOpenIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { clientConfig } from "@/lib/config-client";
import { cn } from "@/lib/utils";

interface BrandIconProps extends React.ComponentProps<"svg"> {
  size?: number;
}

export function BrandIcon({ size = 24, className, ...props }: BrandIconProps) {
  return (
    <BookOpenIcon
      size={size}
      weight="duotone"
      className={cn("text-primary", className)}
      {...props}
    />
  );
}

interface BrandLogoProps extends Omit<
  React.ComponentProps<typeof Link>,
  "href"
> {
  showIcon?: boolean;
  iconSize?: number;
  href?: string;
}

export function BrandLogo({
  showIcon = true,
  iconSize = 24,
  className,
  href = "/",
  ...props
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary",
        className,
      )}
      {...props}
    >
      {showIcon && <BrandIcon size={iconSize} />}
      <span className="text-lg">{clientConfig.APP_NAME}</span>
    </Link>
  );
}
