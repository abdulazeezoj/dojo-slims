/**
 * @file section-error.tsx
 * @description Standardized error display with retry functionality
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WarningCircle } from "@phosphor-icons/react";

interface SectionErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "alert" | "card";
}

export function SectionError({
  title = "Failed to load",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  className,
  variant = "alert",
}: SectionErrorProps) {
  if (variant === "card") {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <WarningCircle className="h-5 w-5" />
            <h3 className="font-semibold">{title}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Alert variant (default)
  return (
    <Alert variant="destructive" className={cn(className)}>
      <WarningCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
