import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from "@/lib/api-helpers";

// GET: List articles for frontend
export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = getPaginationParams(request);

    const [list, total] = await Promise.all([
      db.article.findMany({
        where: { status: "published" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { publishedAt: "desc" },
        include: {
          creator: { select: { id: true, username: true } },
        },
      }),
      db.article.count({ where: { status: "published" } }),
    ]);

    const cleaned = list.map((a) => ({
      ...a,
      content: a.content ?? null,
      coverImage: a.coverImage ?? null,
      tags: a.tags ?? null,
      publishedAt: a.publishedAt ?? null,
      creator: a.creator ?? null,
    }));

    return paginatedResponse(cleaned, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/about/articles error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}