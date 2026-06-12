"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  locale: string;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, locale, onToggleFavorite, className }: ProductCardProps) {
  const coverImage = product.coverImage || "/placeholder-product.svg";
  const categoryName = typeof product.category?.name === "string" ? product.category.name : "";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        className
      )}
    >
      <Link href={`/${locale}/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {categoryName && (
            <Badge variant="secondary" className="absolute top-2 left-2 z-10">
              {categoryName}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            {product.price != null ? (
              <span className="text-lg font-bold text-primary">
                {locale === "zh" ? "¥" : "$"}
                {product.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {locale === "zh" ? "价格面议" : "Contact for price"}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {product.likeCount}
            </span>
          </div>
        </div>
      </Link>

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite?.(product);
        }}
        className={cn(
          "absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all",
          product.isFavorite
            ? "bg-red-500 text-white"
            : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500"
        )}
        aria-label={product.isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn("h-4 w-4", product.isFavorite && "fill-white")}
        />
      </button>
    </div>
  );
}