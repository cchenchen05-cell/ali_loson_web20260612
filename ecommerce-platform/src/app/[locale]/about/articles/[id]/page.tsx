"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronRight, Home, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { api } from "@/lib/api";
import type { Article } from "@/types";

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = Number(params.id);

  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      try {
        const res = await api.get<Article>(`/api/v1/articles/${articleId}`);
        setArticle(res.data || null);
      } catch {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(articleId)) {
      fetchArticle();
    }
  }, [articleId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-5 w-48 mb-8" />
        <Skeleton className="aspect-video w-full max-w-3xl rounded-xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <div className="space-y-3 max-w-3xl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20">
        <EmptyState
          title="文章未找到"
          description="该文章可能已被删除或不存在"
          action={
            <Link href="/about/articles">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回文章列表
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="glass border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-white/60 flex-wrap">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/about/intro" className="hover:text-white transition-colors">
              关于我们
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/about/articles" className="hover:text-white transition-colors">
              文章
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 glass-card">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-8 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.split(",").map((tag, i) => (
                <span
                  key={i}
                  className="text-xs glass px-3 py-1 rounded-full text-white/70"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          {article.content && (
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div
                className="prose prose-sm max-w-none prose-invert"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          )}

          {/* Back */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <Link href="/about/articles">
              <Button variant="outline" className="gap-2 glass border-white/20 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />
                返回文章列表
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}