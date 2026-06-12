"use client";

import { cn } from "@/components/ui/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      <div className="aspect-square rounded-xl bg-muted" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-muted"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}