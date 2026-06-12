import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const article = await db.article.findFirst({
      where: { id, status: "published" },
      include: {
        creator: { select: { id: true, username: true } },
      },
    });

    if (!article) return errorResponse(404, "Article not found");

    const cleaned = {
      ...article,
      content: article.content ?? null,
      coverImage: article.coverImage ?? null,
      tags: article.tags ?? null,
      publishedAt: article.publishedAt ?? null,
      creator: article.creator ?? null,
    };

    return successResponse(cleaned);
  } catch (error) {
    console.error("GET /api/v1/about/articles/[id] error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}