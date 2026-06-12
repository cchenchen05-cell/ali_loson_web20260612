import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!, 10)
      : undefined;
    const sort = searchParams.get("sort") || "comprehensive";

    const where: Prisma.ProductWhereInput = {
      status: "published",
    };

    if (search) {
      where.name = { contains: search };
    }

    if (categoryId && !isNaN(categoryId)) {
      where.categoryId = categoryId;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { sortOrder: "asc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "latest":
        orderBy = { publishedAt: "desc" };
        break;
      case "comprehensive":
      default:
        orderBy = { sortOrder: "asc" };
        break;
    }

    const [list, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    const cleanedList = list.map((p) => ({
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

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/products error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}