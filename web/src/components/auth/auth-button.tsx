"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { ComponentProps } from "react";

interface AuthButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
}

export function AuthButton({
  isLoading,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      className={cn("w-full", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <CircleNotchIcon className="h-4 w-4 animate-spin" weight="bold" />
      )}
      {isLoading ? loadingText || children : children}
    </Button>
  );
}
