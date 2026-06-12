"use client";

import * as React from "react";
import type { Product } from "@/types";

const STORAGE_KEY = "favorites";

interface UseFavoritesReturn {
  favorites: Product[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  clearFavorites: () => void;
  count: number;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = React.useState<Product[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setFavorites(raw ? JSON.parse(raw) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const save = React.useCallback((items: Product[]) => {
    setFavorites(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const isFavorite = React.useCallback(
    (productId: number) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const toggleFavorite = React.useCallback(
    (product: Product) => {
      const index = favorites.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        save([...favorites.slice(0, index), ...favorites.slice(index + 1)]);
      } else {
        save([{ ...product, isFavorite: true }, ...favorites]);
      }
    },
    [favorites, save]
  );

  const removeFavorite = React.useCallback(
    (productId: number) => {
      save(favorites.filter((p) => p.id !== productId));
    },
    [favorites, save]
  );

  const clearFavorites = React.useCallback(() => {
    save([]);
  }, [save]);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites, count: favorites.length };
}