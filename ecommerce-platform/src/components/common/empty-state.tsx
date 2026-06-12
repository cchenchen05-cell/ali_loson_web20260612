"use client";

import { cn } from "@/components/ui/utils";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = "No data",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-4", className)}>
      <div className="text-muted-foreground mb-4">
        {icon || <PackageOpen className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}