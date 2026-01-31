"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

interface AuthAlertProps {
  type: "error" | "success" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
}

export function AuthAlert({ type, title, message, className }: AuthAlertProps) {
  const config = {
    error: {
      icon: XCircleIcon,
      className: "border-destructive/50 text-destructive",
      defaultTitle: "Error",
    },
    success: {
      icon: CheckCircleIcon,
      className: "border-primary/50 text-primary",
      defaultTitle: "Success",
    },
    warning: {
      icon: WarningIcon,
      className: "border-yellow-500/50 text-yellow-600 dark:text-yellow-500",
      defaultTitle: "Warning",
    },
    info: {
      icon: InfoIcon,
      className: "border-blue-500/50 text-blue-600 dark:text-blue-500",
      defaultTitle: "Information",
    },
  };

  const { icon: Icon, className: alertClassName, defaultTitle } = config[type];

  return (
    <Alert className={cn(alertClassName, className)}>
      <Icon className="h-4 w-4" weight="duotone" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className={!title ? "ml-0" : undefined}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
