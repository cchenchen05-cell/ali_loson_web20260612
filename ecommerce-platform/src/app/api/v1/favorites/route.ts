import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

function getVisitorId(request: NextRequest): string | null {
  return request.nextUrl.searchParams.get("visitorId") || null;
}

// GET: Get favorites for a visitor
export async function GET(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request);
    if (!visitorId) {
      return successResponse([]);
    }

    const favorites = await db.favorite.findMany({
      where: { visitorId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImage: true,
            price: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const cleaned = favorites.map((f) => ({
      ...f,
      product: f.product
        ? { ...f.product, coverImage: f.product.coverImage ?? null, price: f.product.price ?? null }
        : null,
    }));

    return successResponse(cleaned);
  } catch (error) {
    console.error("GET /api/v1/favorites error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Add favorite or sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, productId } = body;

    if (!visitorId || !productId) {
      return errorResponse(400, "visitorId and productId are required");
    }

    const existing = await db.favorite.findFirst({
      where: { visitorId, productId: parseInt(productId, 10) },
    });

    if (existing) {
      return successResponse(existing, "Already favorited");
    }

    const favorite = await db.favorite.create({
      data: {
        visitorId,
        productId: parseInt(productId, 10),
      },
    });

    // Update product likeCount
    await db.product.update({
      where: { id: parseInt(productId, 10) },
      data: { actualLikeCount: { increment: 1 } },
    });

    return successResponse(favorite, "Added to favorites");
  } catch (error) {
    console.error("POST /api/v1/favorites error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Remove favorite
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const visitorId = searchParams.get("visitorId");
    const productId = searchParams.get("productId")
      ? parseInt(searchParams.get("productId")!, 10)
      : null;

    if (!visitorId || !productId) {
      return errorResponse(400, "visitorId and productId are required");
    }

    await db.favorite.deleteMany({
      where: { visitorId, productId },
    });

    // Update product likeCount
    await db.product.update({
      where: { id: productId },
      data: { actualLikeCount: { decrement: 1 } },
    });

    return successResponse(null, "Removed from favorites");
  } catch (error) {
    console.error("DELETE /api/v1/favorites error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}