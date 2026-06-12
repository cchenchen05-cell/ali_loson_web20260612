import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  paginatedResponse,
  getIpAddress,
} from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

async function createAuditLog(
  userId: number,
  action: string,
  targetType: string,
  targetId: string,
  ipAddress: string,
  oldData?: any,
  newData?: any
) {
  await db.auditLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      ipAddress,
    },
  });
}

// GET: List reviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const productId = searchParams.get("productId")
      ? parseInt(searchParams.get("productId")!, 10)
      : undefined;

    const where: Prisma.ReviewWhereInput = {};
    if (status) where.status = status;
    if (productId && !isNaN(productId)) where.productId = productId;

    const [list, total] = await Promise.all([
      db.review.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true } },
          creator: { select: { id: true, username: true } },
        },
      }),
      db.review.count({ where }),
    ]);

    const cleanedList = list.map((r) => ({
      ...r,
      productId: r.productId ?? null,
      clientName: r.clientName ?? null,
      avatarUrl: r.avatarUrl ?? null,
      videoUrl: r.videoUrl ?? null,
      content: r.content ?? null,
      tags: r.tags ?? null,
      product: r.product ?? null,
      creator: r.creator ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/reviews error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { productId, clientName, avatarUrl, videoUrl, content, rating, tags, status } = body;

    if (!content) {
      return errorResponse(400, "Content is required");
    }

    const review = await db.review.create({
      data: {
        productId: productId ? parseInt(productId, 10) : null,
        createdBy: userId,
        clientName: clientName ?? null,
        avatarUrl: avatarUrl ?? null,
        videoUrl: videoUrl ?? null,
        content,
        rating: rating || 5,
        tags: tags ?? null,
        status: status || "published",
      },
    });

    await createAuditLog(userId, "create", "review", String(review.id), ip, null, review);

    return successResponse(review, "Review created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/reviews error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update review
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse(400, "Review ID is required");
    }

    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Review not found");
    }

    const updateData: any = {};
    if (data.productId !== undefined) updateData.productId = data.productId ? parseInt(data.productId, 10) : null;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.status !== undefined) updateData.status = data.status;

    const review = await db.review.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "review", String(review.id), ip, existing, review);

    return successResponse(review, "Review updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/reviews error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete review
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get("id") || "", 10);

    if (isNaN(id)) {
      return errorResponse(400, "Review ID is required");
    }

    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Review not found");
    }

    await db.review.delete({ where: { id } });

    await createAuditLog(userId, "delete", "review", String(id), ip, existing, null);

    return successResponse(null, "Review deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/reviews error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}