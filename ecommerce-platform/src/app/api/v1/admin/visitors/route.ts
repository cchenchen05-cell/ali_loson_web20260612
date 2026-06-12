import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

// GET: List visitors with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const where: Prisma.VisitorWhereInput = {};
    if (search) {
      where.OR = [
        { fingerprint: { contains: search } },
        { ipAddress: { contains: search } },
        { country: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const [list, total] = await Promise.all([
      db.visitor.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { lastVisitAt: "desc" },
      }),
      db.visitor.count({ where }),
    ]);

    const cleanedList = list.map((v) => ({
      ...v,
      userAgent: v.userAgent ?? null,
      ipAddress: v.ipAddress ?? null,
      country: v.country ?? null,
      region: v.region ?? null,
      city: v.city ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/visitors error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}