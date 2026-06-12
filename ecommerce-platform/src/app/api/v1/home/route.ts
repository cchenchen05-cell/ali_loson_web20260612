import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    // Active banners
    const banners = await db.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });

    const bannersWithDefaults = banners.map((b) => ({
      ...b,
      endAt: b.endAt ?? null,
      startAt: b.startAt ?? null,
      title: b.title ?? null,
      linkUrl: b.linkUrl ?? null,
    }));

    // Hot products (top 8 featured)
    const hotProducts = await db.product.findMany({
      where: {
        status: "published",
        featured: true,
      },
      take: 8,
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const hotProductsCleaned = hotProducts.map((p) => ({
      ...p,
      subtitle: p.subtitle ?? null,
      description: p.description ?? null,
      summary: p.summary ?? null,
      coverImage: p.coverImage ?? null,
      images: p.images ?? null,
      price: p.price ?? null,
      specifications: p.specifications ?? null,
      seoTitle: p.seoTitle ?? null,
      seoDescription: p.seoDescription ?? null,
      seoKeywords: p.seoKeywords ?? null,
      translations: p.translations ?? null,
      publishedAt: p.publishedAt ?? null,
    }));

    // Hot categories (with product count)
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    const hotCategories = categories
      .filter((c) => c._count.products > 0)
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        parentId: c.parentId,
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? null,
        image: c.image ?? null,
        previewImage: c.previewImage ?? null,
        description: c.description ?? null,
        sortOrder: c.sortOrder,
        productCount: c._count.products,
      }));

    // Latest reviews (5)
    const latestReviews = await db.review.findMany({
      where: { status: "published" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, slug: true, coverImage: true },
        },
      },
    });

    const latestReviewsCleaned = latestReviews.map((r) => ({
      ...r,
      productId: r.productId ?? null,
      clientName: r.clientName ?? null,
      avatarUrl: r.avatarUrl ?? null,
      videoUrl: r.videoUrl ?? null,
      content: r.content ?? null,
      tags: r.tags ?? null,
      product: r.product
        ? { ...r.product, coverImage: r.product.coverImage ?? null }
        : null,
    }));

    // Static contents
    const staticContentKeys = ["why-choose-us", "purchase-process", "suitable-venues"];
    const staticContents = await db.staticContent.findMany({
      where: { key: { in: staticContentKeys } },
    });

    const staticContentsCleaned = staticContents.map((s) => ({
      ...s,
      title: s.title ?? null,
      content: s.content ?? null,
      images: s.images ?? null,
    }));

    return successResponse({
      banners: bannersWithDefaults,
      hotProducts: hotProductsCleaned,
      hotCategories,
      latestReviews: latestReviewsCleaned,
      staticContents: staticContentsCleaned,
    });
  } catch (error) {
    console.error("GET /api/v1/home error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}