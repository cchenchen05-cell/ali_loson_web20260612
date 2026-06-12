import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const clients = await db.client.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const cleaned = clients.map((c) => ({
      ...c,
      logoUrl: c.logoUrl ?? null,
      websiteUrl: c.websiteUrl ?? null,
      description: c.description ?? null,
    }));

    return successResponse(cleaned);
  } catch (error) {
    console.error("GET /api/v1/clients error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}