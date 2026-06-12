import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const banners = await db.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
        AND: [
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });

    const cleaned = banners.map((b) => ({
      ...b,
      title: b.title ?? null,
      linkUrl: b.linkUrl ?? null,
      startAt: b.startAt ?? null,
      endAt: b.endAt ?? null,
    }));

    return successResponse(cleaned);
  } catch (error) {
    console.error("GET /api/v1/banners error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}