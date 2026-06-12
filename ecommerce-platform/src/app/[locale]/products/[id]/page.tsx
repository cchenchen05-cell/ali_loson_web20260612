"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronRight, Home, Heart, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/product-card";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { EmptyState } from "@/components/common/empty-state";
import { api } from "@/lib/api";
import { cn } from "@/components/ui/utils";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeImage, setActiveImage] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(false);
  const [showInquiry, setShowInquiry] = React.useState(false);
  const [likeAnimating, setLikeAnimating] = React.useState(false);

  React.useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const [prodRes] = await Promise.all([
          api.get<Product>(`/api/v1/products/${productId}`),
        ]);
        setProduct(prodRes.data || null);

        // Try to get related products from category
        if (prodRes.data?.categoryId) {
          try {
            const catRelated = await api.get<{ list: Product[] }>(
              `/api/v1/products?categoryId=${prodRes.data.categoryId}&pageSize=4&exclude=${productId}`
            );
            setRelatedProducts(catRelated.data?.list || []);
          } catch {
            setRelatedProducts([]);
          }
        }
      } catch {
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(productId)) {
      fetchProduct();
    }
  }, [productId]);

  React.useEffect(() => {
    try {
      const liked = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsLiked(liked.some((p: Product) => p.id === productId));
    } catch {
      /* ignore */
    }
  }, [productId]);

  const images = React.useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.coverImage) imgs.push(product.coverImage);
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) imgs.push(...parsed);
      } catch {
        /* ignore */
      }
    }
    return imgs.length > 0 ? imgs : ["/placeholder-product.svg"];
  }, [product]);

  const specifications: Record<string, string> = React.useMemo(() => {
    if (!product?.specifications) return {};
    try {
      return JSON.parse(product.specifications);
    } catch {
      return {};
    }
  }, [product?.specifications]);

  const handleLike = () => {
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 600);

    try {
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (isLiked) {
        const idx = stored.findIndex((p: Product) => p.id === productId);
        if (idx >= 0) stored.splice(idx, 1);
        setIsLiked(false);
      } else {
        stored.unshift({ ...product, isFavorite: true } as Product);
        setIsLiked(true);
      }
      localStorage.setItem("favorites", JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  };

  const handleToggleFavorite = (p: Product) => {
    try {
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      const idx = stored.findIndex((item: Product) => item.id === p.id);
      if (idx >= 0) {
        stored.splice(idx, 1);
      } else {
        stored.unshift({ ...p, isFavorite: true });
      }
      localStorage.setItem("favorites", JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <EmptyState
          title="产品未找到"
          description="该产品可能已下架或不存在"
          action={
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回产品列表
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
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-foreground transition-colors">
              产品列表
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4 border">
              <Image
                src={images[activeImage] || "/placeholder-product.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {product.featured && (
                <Badge className="absolute top-3 left-3">热门</Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
                      i === activeImage
                        ? "border-primary ring-1 ring-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

            {product.summary && (
              <p className="text-muted-foreground mb-6 leading-relaxed">{product.summary}</p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              {product.price != null ? (
                <span className="text-3xl font-bold text-primary">
                  ¥{product.price.toLocaleString()}
                </span>
              ) : (
                <span className="text-xl text-muted-foreground">价格面议</span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-8">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="lg"
                onClick={handleLike}
                className={cn(
                  "gap-2 transition-all",
                  likeAnimating && "scale-125",
                  isLiked && "bg-red-500 hover:bg-red-600 border-red-500"
                )}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-all",
                    likeAnimating && "animate-bounce",
                    isLiked && "fill-white"
                  )}
                />
                {product.likeCount > 0 && (
                  <span>{product.likeCount}</span>
                )}
                {isLiked ? "已收藏" : "加入收藏"}
              </Button>

              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowInquiry(!showInquiry)}>
                立即咨询
              </Button>
            </div>
          </div>
        </div>

        {/* Inquiry Form (Collapsible) */}
        {showInquiry && (
          <Card className="mb-12 p-6">
            <InquiryForm locale="zh" preSelectedProductIds={[product.id]} />
          </Card>
        )}

        {/* Description */}
        {product.description && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">产品描述</h2>
            <Card className="p-6">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </Card>
          </section>
        )}

        {/* Specifications */}
        {Object.keys(specifications).length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">产品参数</h2>
            <Card>
              <div className="divide-y">
                {Object.entries(specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center px-6 py-3"
                  >
                    <span className="w-40 text-sm text-muted-foreground shrink-0">{key}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">相关产品</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  locale="zh"
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}