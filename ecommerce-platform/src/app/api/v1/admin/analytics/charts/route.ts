import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse(401, "Unauthorized");

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "pv"; // pv | events | top_products

    const now = new Date();
    const days = parseInt(searchParams.get("days") || "7", 10);

    const result: any = {};

    // PV/UV data
    if (type === "pv") {
      const analyticsData: { date: string; pv: number; uv: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const dateStr = date.toISOString().slice(0, 10);

        const [pv, uv] = await Promise.all([
          db.analyticsEvent.count({
            where: { eventType: "page_view", createdAt: { gte: date, lte: dateEnd } },
          }),
          db.analyticsEvent.groupBy({
            by: ["visitorId"],
            where: { eventType: "page_view", createdAt: { gte: date, lte: dateEnd } },
          }),
        ]);

        analyticsData.push({ date: dateStr, pv, uv: uv.length });
      }
      result.pvData = analyticsData;
    }

    // Event distribution
    if (type === "events") {
      const eventDistribution = await db.analyticsEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
          },
        },
      });

      result.eventDistribution = eventDistribution.map((e) => ({
        type: e.eventType,
        count: e._count.id,
      }));
    }

    // Top products
    if (type === "top_products") {
      const topProducts = await db.analyticsEvent.groupBy({
        by: ["targetId"],
        _count: { id: true },
        where: {
          eventType: { in: ["product_click", "favorite"] },
          createdAt: {
            gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });

      const productIds = topProducts
        .map((p) => (p.targetId ? parseInt(p.targetId, 10) : 0))
        .filter((id) => id > 0);

      const products = productIds.length > 0
        ? await db.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, slug: true, coverImage: true, actualLikeCount: true },
          })
        : [];

      const productMap = new Map(products.map((p) => [p.id, p]));

      result.topProducts = topProducts
        .map((p) => ({
          targetId: p.targetId,
          count: p._count.id,
          product: productMap.get(parseInt(p.targetId || "0", 10)) || null,
        }))
        .filter((p) => p.product !== null);
    }

    return successResponse(result);
  } catch (error) {
    console.error("GET /api/v1/admin/analytics/charts error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}