/**
 * @file stat-card.tsx
 * @description Reusable stat card component for displaying metrics
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs mt-1">{description}</p>
        {trend && (
          <div
            className={cn(
              "text-xs font-medium mt-1 flex items-center gap-1",
              trend.isPositive ? "text-green-600" : "text-red-600",
            )}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
