"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  source?: string;
  className?: string;
  placeholder?: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SlugInput({ value, onChange, source, className, placeholder = "product-slug" }: SlugInputProps) {
  const [manualEdit, setManualEdit] = React.useState(false);

  React.useEffect(() => {
    if (source && !manualEdit) {
      const slug = generateSlug(source);
      if (slug) onChange(slug);
    }
  }, [source, manualEdit, onChange]);

  return (
    <div className={cn("space-y-1", className)}>
      <Input
        value={value}
        onChange={(e) => {
          setManualEdit(true);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
      />
      <p className="text-xs text-muted-foreground">
        自动从名称生成，可手动编辑
      </p>
    </div>
  );
}