import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api-helpers";

// GET: List favorites grouped by product
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);

    // Get favorites grouped by product
    const favorites = await db.favorite.groupBy({
      by: ["productId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const productIds = favorites.map((f) => f.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        coverImage: true,
        price: true,
        status: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const grouped = favorites
      .map((f) => ({
        productId: f.productId,
        favoriteCount: f._count.id,
        product: productMap.get(f.productId)
          ? {
              ...productMap.get(f.productId)!,
              coverImage: productMap.get(f.productId)!.coverImage ?? null,
              price: productMap.get(f.productId)!.price ?? null,
            }
          : null,
      }))
      .filter((g) => g.product !== null);

    const total = grouped.length;
    const paginatedList = grouped.slice((page - 1) * pageSize, page * pageSize);

    return paginatedResponse(paginatedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/favorites error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}