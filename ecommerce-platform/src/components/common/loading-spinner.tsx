"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/components/ui/utils";

interface LoadingSpinnerProps {
  size?: "default" | "sm" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "default", className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 gap-3", className)}>
      <Spinner size={size} className="text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}