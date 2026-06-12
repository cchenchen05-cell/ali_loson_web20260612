import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId")
      ? parseInt(searchParams.get("productId")!, 10)
      : undefined;

    const where: any = { status: "published" };
    if (productId && !isNaN(productId)) where.productId = productId;

    const [list, total] = await Promise.all([
      db.review.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true, coverImage: true } },
        },
      }),
      db.review.count({ where }),
    ]);

    const cleaned = list.map((r) => ({
      ...r,
      productId: r.productId ?? null,
      clientName: r.clientName ?? null,
      avatarUrl: r.avatarUrl ?? null,
      videoUrl: r.videoUrl ?? null,
      content: r.content ?? null,
      tags: r.tags ?? null,
      product: r.product ? { ...r.product, coverImage: r.product.coverImage ?? null } : null,
    }));

    return paginatedResponse(cleaned, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/reviews error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}