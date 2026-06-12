import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const [
      productCount,
      categoryCount,
      articleCount,
    ] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.article.count(),
    ]);

    // Today's inquiries count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayInquiries = await db.inquiry.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    // Recent logs (5)
    const recentLogs = await db.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    const recentLogsCleaned = recentLogs.map((log) => ({
      ...log,
      targetType: log.targetType ?? null,
      targetId: log.targetId ?? null,
      oldData: log.oldData ?? null,
      newData: log.newData ?? null,
      ipAddress: log.ipAddress ?? null,
      user: log.user ?? null,
    }));

    return successResponse({
      productCount,
      categoryCount,
      articleCount,
      todayInquiries,
      recentLogs: recentLogsCleaned,
    });
  } catch (error) {
    console.error("GET /api/v1/admin/dashboard error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}