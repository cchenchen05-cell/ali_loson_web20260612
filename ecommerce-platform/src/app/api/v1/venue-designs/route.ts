import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;

    const where: any = { status: "published" };
    if (category) where.category = category;

    const [list, total] = await Promise.all([
      db.venueDesign.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: "asc" },
      }),
      db.venueDesign.count({ where }),
    ]);

    const cleaned = list.map((v) => ({
      ...v,
      description: v.description ?? null,
      images: v.images ?? null,
      category: v.category ?? null,
    }));

    return paginatedResponse(cleaned, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/venue-designs error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}