"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/common/empty-state";
import { api } from "@/lib/api";
import { cn } from "@/components/ui/utils";
import type { Product, Category } from "@/types";

const sortOptions = [
  { value: "comprehensive", label: "综合" },
  { value: "price_asc", label: "价格从低到高" },
  { value: "price_desc", label: "价格从高到低" },
  { value: "latest", label: "最新" },
];

export function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "comprehensive";
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(
    new Set(category ? category.split(",") : [])
  );
  const [searchInput, setSearchInput] = React.useState(search);

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<Category[]>("/api/v1/categories");
        setCategories(res.data || []);
      } catch {
        /* ignore */
      }
    }
    fetchCategories();
  }, []);

  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", "12");
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (sort !== "comprehensive") params.set("sort", sort);

        const res = await api.get<{ list: Product[]; total: number; totalPages: number }>(
          `/api/v1/products?${params.toString()}`
        );
        setProducts(res.data?.list || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.totalPages || 1);
      } catch {
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page, search, category, sort]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!updates.page) params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      const catStr = Array.from(next).join(",");
      updateParams({ category: catStr });
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  const handleToggleFavorite = (product: Product) => {
    try {
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      const idx = stored.findIndex((p: Product) => p.id === product.id);
      if (idx >= 0) {
        stored.splice(idx, 1);
      } else {
        stored.unshift({ ...product, isFavorite: true });
      }
      localStorage.setItem("favorites", JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">产品列表</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索产品..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="lg:hidden gap-2"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              筛选
            </Button>
            <Select
              value={sort}
              onChange={(v) => updateParams({ sort: v })}
              options={sortOptions}
              className="w-40"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filter */}
          <aside
            className={cn(
              "w-56 shrink-0",
              filterOpen
                ? "fixed inset-0 z-40 bg-background p-6 overflow-y-auto lg:relative lg:inset-auto lg:p-0 lg:bg-transparent"
                : "hidden lg:block"
            )}
          >
            {filterOpen && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold">分类筛选</h3>
                <Button variant="ghost" size="sm" onClick={() => setFilterOpen(false)}>
                  ✕
                </Button>
              </div>
            )}

            <h3 className="font-semibold mb-3 text-sm hidden lg:block">分类筛选</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors hover:bg-accent",
                    selectedCategories.has(cat.slug) && "bg-primary/5 text-primary font-medium"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.slug)}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  {cat.name}
                </label>
              ))}
            </div>

            {filterOpen && (
              <div className="mt-6 lg:hidden">
                <Button className="w-full" onClick={() => setFilterOpen(false)}>
                  应用筛选
                </Button>
              </div>
            )}
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="未找到相关产品"
                description="试试其他搜索词或分类筛选"
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchInput("");
                      setSelectedCategories(new Set());
                      router.push("?");
                    }}
                  >
                    清除筛选
                  </Button>
                }
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    共 {total} 件产品
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale="zh"
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>

                <div className="mt-8">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParams({ page: String(p) })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}