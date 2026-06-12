"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  ArrowRight,
  Star,
  Shield,
  Truck,
  Headphones,
  Award,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/product-card";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { api } from "@/lib/api";
import { cn } from "@/components/ui/utils";
import type { Product, Category, Review } from "@/types";

const whyChooseUsItems = [
  {
    icon: Shield,
    titleZh: "品质保证",
    titleEn: "Quality Assurance",
    descZh: "ISO9001认证，严苛质检流程",
    descEn: "ISO9001 certified, rigorous quality control",
  },
  {
    icon: Truck,
    titleZh: "快速配送",
    titleEn: "Fast Shipping",
    descZh: "全球物流网络，安全送达",
    descEn: "Global logistics network, safe delivery",
  },
  {
    icon: Headphones,
    titleZh: "专业服务",
    titleEn: "Professional Service",
    descZh: "7x24小时在线支持",
    descEn: "7x24 online support",
  },
  {
    icon: Award,
    titleZh: "丰富经验",
    titleEn: "Rich Experience",
    descZh: "15+年行业深耕，5000+客户信赖",
    descEn: "15+ years experience, 5000+ trusted clients",
  },
];

const purchaseSteps = [
  { step: "01", titleZh: "需求沟通", titleEn: "Consultation", descZh: "了解您的场地和需求", descEn: "Understand your venue and needs" },
  { step: "02", titleZh: "方案报价", titleEn: "Quotation", descZh: "提供定制化解决方案", descEn: "Provide customized solutions" },
  { step: "03", titleZh: "生产制造", titleEn: "Production", descZh: "严格品控精准交付", descEn: "Strict quality control, precise delivery" },
  { step: "04", titleZh: "物流发货", titleEn: "Delivery", descZh: "全球直达安全运输", descEn: "Global direct shipping" },
];

export default function HomePage() {
  const t = useTranslations("home");
  const ct = useTranslations("common");
  const vt = useTranslations("contact");
  const locale = useLocale();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reviewIndex, setReviewIndex] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes, reviewRes] = await Promise.all([
          api.get<Category[]>("/api/v1/categories?parentId=null"),
          api.get<{ list: Product[] }>("/api/v1/products?pageSize=8&sort=popular"),
          api.get<{ list: Review[] }>("/api/v1/reviews?pageSize=10"),
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data?.list || []);
        setReviews(reviewRes.data?.list || []);
      } catch {
        // Silently fail - sections will show skeleton or empty
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const nextReview = () => {
    if (reviews.length > 0) {
      setReviewIndex((prev) => (prev + 1) % reviews.length);
    }
  };
  const prevReview = () => {
    if (reviews.length > 0) {
      setReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 text-sm">
              {t("heroTitle")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Search className="h-4 w-4" />
                  {t("browseProducts")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {t("contactUs")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t("hotCategories")}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("hotCategories")}
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-primary hover:underline hidden sm:flex items-center gap-1"
            >
              {ct("viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-40 md:w-48">
                    <Skeleton className="h-40 md:h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                  </div>
                ))
              : categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="shrink-0 w-40 md:w-48 group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-background border shadow-sm group-hover:shadow-md transition-all">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 160px, 192px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-secondary/10">
                          <span className="text-3xl font-bold text-primary/30">
                            {cat.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-sm font-medium text-center">
                          {cat.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Hot Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t("hotProducts")}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("hotProducts")}
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-primary hover:underline hidden sm:flex items-center gap-1"
            >
              {ct("viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale="zh"
                    onToggleFavorite={() => {
                      const stored = JSON.parse(
                        localStorage.getItem("favorites") || "[]"
                      );
                      const idx = stored.findIndex(
                        (p: Product) => p.id === product.id
                      );
                      if (idx >= 0) {
                        stored.splice(idx, 1);
                      } else {
                        stored.unshift({ ...product, isFavorite: true });
                      }
                      localStorage.setItem("favorites", JSON.stringify(stored));
                    }}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {t("whyChooseUs")}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t("whyChooseUs")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {whyChooseUsItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Card
                  key={i}
                  className="text-center p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {locale === "zh" ? item.titleZh : item.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === "zh" ? item.descZh : item.descEn}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {t("customerReviews")}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t("customerReviews")}
          </p>

          {reviews.length > 0 ? (
            <div className="relative max-w-2xl mx-auto">
              <Card className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < (reviews[reviewIndex]?.rating || 5)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <p className="text-base leading-relaxed mb-6">
                  {reviews[reviewIndex]?.content || "Great products!"}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {(reviews[reviewIndex]?.clientName || "A")[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {reviews[reviewIndex]?.clientName || "Anonymous"}
                    </p>
                    {reviews[reviewIndex]?.tags && (
                      <p className="text-xs text-muted-foreground">
                        {reviews[reviewIndex].tags}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevReview}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextReview}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {ct("noData")}
            </div>
          )}
        </div>
      </section>

      {/* Purchase Process */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {t("purchaseProcess")}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t("purchaseProcess")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {purchaseSteps.map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">
                  {locale === "zh" ? item.titleZh : item.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? item.descZh : item.descEn}
                </p>
                {i < purchaseSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Inquiry */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {vt("title")}
              </h2>
              <p className="text-muted-foreground mb-8">{vt("subtitle")}</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{vt("address")}</p>
                    <p className="text-sm text-muted-foreground">
                      Panyu District, Guangzhou, China
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{vt("phone")}</p>
                    <p className="text-sm text-muted-foreground">
                      +86 400-123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{vt("email")}</p>
                    <p className="text-sm text-muted-foreground">
                      info@example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{vt("workingHours")}</p>
                    <p className="text-sm text-muted-foreground">
                      Mon - Fri, 9:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <Card className="p-6">
              <InquiryForm locale="zh" />
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}