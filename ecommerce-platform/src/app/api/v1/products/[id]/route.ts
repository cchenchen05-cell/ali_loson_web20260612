import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, "Invalid product ID");
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images_rel: { orderBy: { sortOrder: "asc" } },
        reviews: {
          where: { status: "published" },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product || product.status !== "published") {
      return errorResponse(404, "Product not found");
    }

    // Related products (same category, 4 items)
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "published",
      },
      take: 4,
      orderBy: { sortOrder: "asc" },
    });

    const relatedCleaned = relatedProducts.map((p) => ({
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

    const productCleaned = {
      ...product,
      subtitle: product.subtitle ?? null,
      description: product.description ?? null,
      summary: product.summary ?? null,
      coverImage: product.coverImage ?? null,
      images: product.images ?? null,
      price: product.price ?? null,
      specifications: product.specifications ?? null,
      seoTitle: product.seoTitle ?? null,
      seoDescription: product.seoDescription ?? null,
      seoKeywords: product.seoKeywords ?? null,
      translations: product.translations ?? null,
      publishedAt: product.publishedAt ?? null,
      category: {
        ...product.category,
        icon: product.category.icon ?? null,
        image: product.category.image ?? null,
        previewImage: product.category.previewImage ?? null,
        description: product.category.description ?? null,
      },
      reviews: product.reviews.map((r) => ({
        ...r,
        productId: r.productId ?? null,
        clientName: r.clientName ?? null,
        avatarUrl: r.avatarUrl ?? null,
        videoUrl: r.videoUrl ?? null,
        content: r.content ?? null,
        tags: r.tags ?? null,
      })),
      images_rel: product.images_rel.map((img) => ({
        ...img,
        alt: img.alt ?? null,
      })),
    };

    return successResponse({
      product: productCleaned,
      relatedProducts: relatedCleaned,
    });
  } catch (error) {
    console.error("GET /api/v1/products/[id] error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}