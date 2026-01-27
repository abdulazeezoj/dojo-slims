"use client";

import { cn } from "@/lib/utils";

interface SectionProps extends React.ComponentProps<"section"> {
  container?: boolean;
}

export function Section({
  container = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 md:py-24", className)} {...props}>
      {container ? (
        <div className="container mx-auto px-4">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

interface SectionHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
  centered?: boolean;
}

export function SectionHeader({
  title,
  description,
  centered = true,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-3",
        centered && "items-center text-center",
        className,
      )}
      {...props}
    >
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl text-lg">{description}</p>
      )}
    </div>
  );
}
