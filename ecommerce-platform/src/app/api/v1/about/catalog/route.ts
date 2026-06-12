import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const content = await db.staticContent.findFirst({ where: { key: "about-catalog" } });
    return successResponse({
      title: content?.title ?? null,
      content: content?.content ?? null,
      images: content?.images ?? null,
    });
  } catch (error) {
    console.error("GET /api/v1/about/catalog error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}