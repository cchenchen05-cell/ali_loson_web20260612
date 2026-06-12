import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, getIpAddress } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse(401, "Unauthorized");

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(400, "Product IDs array is required");
    }
    if (!action || !["publish", "archive", "delete"].includes(action)) {
      return errorResponse(400, "Action must be one of: publish, archive, delete");
    }

    const numericIds = ids.map(Number);

    if (action === "delete") {
      await db.product.deleteMany({ where: { id: { in: numericIds } } });

      // Create audit log
      await db.auditLog.create({
        data: {
          userId,
          action: "delete",
          targetType: "product",
          targetId: ids.join(","),
          ipAddress: ip,
        },
      });
    } else {
      const status = action === "publish" ? "published" : "archived";
      const updateData: any = { status };
      if (action === "publish") {
        updateData.publishedAt = new Date();
      }

      await db.product.updateMany({
        where: { id: { in: numericIds } },
        data: updateData,
      });

      // Create audit log
      await db.auditLog.create({
        data: {
          userId,
          action: action === "publish" ? "status_change" : "update",
          targetType: "product",
          targetId: ids.join(","),
          ipAddress: ip,
        },
      });
    }

    return successResponse(null, `Successfully ${action}ed ${ids.length} products`);
  } catch (error) {
    console.error("POST /api/v1/admin/products/batch error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}