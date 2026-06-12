import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    const where: any = {};
    if (key) where.key = key;

    const items = await db.staticContent.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    const cleaned = items.map((s) => ({
      ...s,
      title: s.title ?? null,
      content: s.content ?? null,
      images: s.images ?? null,
    }));

    return successResponse(cleaned);
  } catch (error) {
    console.error("GET /api/v1/static-content error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}