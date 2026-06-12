"use client";

import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/components/ui/utils";

interface ProductGridProps {
  products: Product[];
  locale: string;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, locale, onToggleFavorite, className, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}