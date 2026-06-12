"use client";

import { cn } from "@/components/ui/utils";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 gap-4", className)}>
      <WifiOff className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <h3 className="text-lg font-medium">Network Error</h3>
        <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}