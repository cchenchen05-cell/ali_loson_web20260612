"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { cn } from "@/components/ui/utils";
import { ChevronRight } from "lucide-react";

interface CategoryNavProps {
  categories: Category[];
  currentCategoryId?: number;
  locale?: string;
  className?: string;
}

export function CategoryNav({ categories, currentCategoryId, locale = "zh", className }: CategoryNavProps) {
  return (
    <nav className={cn("space-y-1", className)}>
      <Link
        href={`/${locale}/products`}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
          !currentCategoryId
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        {locale === "zh" ? "全部分类" : "All Categories"}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/${locale}/products?category=${cat.slug}`}
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
            currentCategoryId === cat.id
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <span>{cat.name}</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        </Link>
      ))}
    </nav>
  );
}