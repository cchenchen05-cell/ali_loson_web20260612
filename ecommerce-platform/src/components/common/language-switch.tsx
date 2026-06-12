"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

interface LanguageSwitchProps {
  locale: string;
  onChange: (locale: string) => void;
  languages?: { code: string; label: string }[];
  className?: string;
}

const DEFAULT_LANGUAGES = [
  { code: "zh", label: "中文" },
  { code: "en", label: "EN" },
];

export function LanguageSwitch({ locale, onChange, languages = DEFAULT_LANGUAGES, className }: LanguageSwitchProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={cn(
            "px-2 py-1 text-xs font-medium rounded transition-colors",
            locale === lang.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}