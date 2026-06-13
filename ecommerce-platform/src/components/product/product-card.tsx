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
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]",
        className
      )}
      style={{
        '--base': 263,
        '--spread': 300,
        '--radius': 16,
        '--border': 2,
        '--backdrop': 'hsl(0 0% 60% / 0.12)',
        '--backup-border': 'var(--backdrop)',
        '--size': 200,
        '--outer': 1,
        '--border-size': 'calc(var(--border, 2) * 1px)',
        '--spotlight-size': 'calc(var(--size, 150) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
        )`,
        backgroundColor: 'var(--backdrop, transparent)',
        backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
        backgroundPosition: '50% 50%',
        backgroundAttachment: 'fixed',
        border: 'var(--border-size) solid var(--backup-border)',
        position: 'relative',
        touchAction: 'none',
      } as React.CSSProperties}
    >
      <Link href={`/${locale}/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/50">
          <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {categoryName && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 z-10 glass-card px-3 py-1 text-xs"
            >
              {categoryName}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 glass-card">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            {product.price != null ? (
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
          "absolute top-3 right-3 z-10 p-2 rounded-full transition-all glass-card",
          product.isFavorite
            ? "bg-red-500/80 text-white"
            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500"
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