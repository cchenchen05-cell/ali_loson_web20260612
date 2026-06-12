"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, Trash2, CheckSquare, Square, ClipboardList } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

const STORAGE_KEY = "favorites";

interface FavoritesPanelProps {
  open: boolean;
  onClose: () => void;
  locale: string;
  onNavigateInquiry?: () => void;
}

function getStoredFavorites(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredFavorites(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function FavoritesPanel({ open, onClose, locale, onNavigateInquiry }: FavoritesPanelProps) {
  const [favorites, setFavorites] = React.useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    setFavorites(getStoredFavorites());
  }, [open]);

  const toggleSelectAll = () => {
    if (selectedIds.size === favorites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const removeFavorites = (ids?: number[]) => {
    const toRemove = ids || Array.from(selectedIds);
    const updated = favorites.filter((p) => !toRemove.includes(p.id));
    setFavorites(updated);
    setStoredFavorites(updated);
    setSelectedIds(new Set());
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/30 transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="font-semibold text-lg">
              {locale === "zh" ? "我喜欢的" : "My Favorites"}
            </h2>
            <span className="text-sm text-muted-foreground">({favorites.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions bar */}
        {favorites.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
            <button
              onClick={toggleSelectAll}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              {selectedIds.size === favorites.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {locale === "zh"
                ? selectedIds.size === favorites.length
                  ? "取消全选"
                  : "全选"
                : selectedIds.size === favorites.length
                  ? "Deselect All"
                  : "Select All"}
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={() => removeFavorites()}
                className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {locale === "zh" ? "删除" : "Remove"} ({selectedIds.size})
              </button>
            )}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-8">
              <Heart className="h-12 w-12 opacity-30" />
              <p className="text-sm">
                {locale === "zh" ? "还没有收藏产品" : "No favorites yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors",
                    selectedIds.has(product.id) && "bg-primary/5"
                  )}
                >
                  <button
                    onClick={() => toggleSelect(product.id)}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {selectedIds.has(product.id) ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  <Link
                    href={`/${locale}/products/${product.id}`}
                    className="shrink-0"
                    onClick={onClose}
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={product.coverImage || "/placeholder-product.svg"}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/products/${product.id}`}
                      className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between mt-1">
                      {product.price != null ? (
                        <span className="text-sm font-semibold text-primary">
                          {locale === "zh" ? "¥" : "$"}{product.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {locale === "zh" ? "价格面议" : "Contact for price"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFavorites([product.id])}
                    className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="border-t p-4 shrink-0">
            <Button
              className="w-full"
              disabled={selectedIds.size === 0}
              onClick={() => {
                // Store selected products for inquiry
                sessionStorage.setItem(
                  "inquiryProductIds",
                  JSON.stringify(Array.from(selectedIds))
                );
                onNavigateInquiry?.();
                onClose();
              }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              {locale === "zh" ? "立即咨询" : "Inquiry"}
              {selectedIds.size > 0 && ` (${selectedIds.size})`}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

