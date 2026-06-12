"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Home, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { api } from "@/lib/api";
import type { Article } from "@/types";

export default function ArticlesPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const res = await api.get<{ list: Article[]; totalPages: number }>(
          `/api/v1/articles?page=${page}&pageSize=9`
        );
        setArticles(res.data?.list || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
            <Link href="/about/intro" className="hover:text-foreground transition-colors">
              关于我们
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">文章</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">文章资讯</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            了解电玩行业最新动态、产品选购指南和经营技巧
          </p>
        </div>
      </div>

      {/* Article Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState title="暂无文章" description="文章内容正在筹备中" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/about/articles/${article.id}`}
                  className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20">
                        <span className="text-4xl font-bold text-primary/30">
                          {article.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                    {article.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-muted px-2 py-0.5 rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}