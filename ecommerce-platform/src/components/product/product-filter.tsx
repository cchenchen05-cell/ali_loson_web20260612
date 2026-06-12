"use client";

import type { Category } from "@/types";
import { cn } from "@/components/ui/utils";

interface ProductFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  selectedSort?: string;
  onSortChange: (sort: string) => void;
  className?: string;
  locale?: string;
}

const SORT_OPTIONS = [
  { value: "comprehensive", labelZh: "综合", labelEn: "Comprehensive" },
  { value: "price_asc", labelZh: "价格从低到高", labelEn: "Price: Low to High" },
  { value: "price_desc", labelZh: "价格从高到低", labelEn: "Price: High to Low" },
  { value: "latest", labelZh: "最新", labelEn: "Latest" },
];

export function ProductFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  selectedSort,
  onSortChange,
  className,
  locale = "zh",
}: ProductFilterProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onCategoryChange("")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full transition-colors",
            !selectedCategoryId
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {locale === "zh" ? "全部" : "All"}
        </button>
        {categories.slice(0, 8).map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(String(cat.id))}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              selectedCategoryId === String(cat.id)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="ml-auto">
        <select
          value={selectedSort || "comprehensive"}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {locale === "zh" ? opt.labelZh : opt.labelEn}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}