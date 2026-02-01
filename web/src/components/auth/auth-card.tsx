import React from "react";

import { BrandIcon } from "@/components/common/brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  showLogo?: boolean;
}

export function AuthCard({
  title,
  subtitle,
  children,
  className,
  showLogo = true,
}: AuthCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="space-y-4 text-center">
        {showLogo && (
          <div className="mx-auto">
            <BrandIcon size={48} />
          </div>
        )}
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-sm text-muted-foreground">
              {subtitle}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
