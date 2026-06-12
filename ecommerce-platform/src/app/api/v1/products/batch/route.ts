import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(400, "Product IDs array is required");
    }

    const products = await db.product.findMany({
      where: { id: { in: ids.map(Number) } },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    const cleaned = products.map((p) => ({
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

    return successResponse(cleaned);
  } catch (error) {
    console.error("POST /api/v1/products/batch error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}