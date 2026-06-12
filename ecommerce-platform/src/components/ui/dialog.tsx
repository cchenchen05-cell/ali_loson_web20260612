"use client";

import { cn } from "./utils";
import { X } from "lucide-react";
import * as React from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg", className)}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}