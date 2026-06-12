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

// GET: List banners
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);

    const [list, total] = await Promise.all([
      db.banner.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: "asc" },
      }),
      db.banner.count(),
    ]);

    const cleanedList = list.map((b) => ({
      ...b,
      title: b.title ?? null,
      linkUrl: b.linkUrl ?? null,
      startAt: b.startAt ?? null,
      endAt: b.endAt ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/banners error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create banner
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { title, imageUrl, linkUrl, sortOrder, isActive, startAt, endAt } = body;

    if (!imageUrl) {
      return errorResponse(400, "Image URL is required");
    }

    const banner = await db.banner.create({
      data: {
        title: title ?? null,
        imageUrl,
        linkUrl: linkUrl ?? null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });

    await createAuditLog(userId, "create", "banner", String(banner.id), ip, null, banner);

    return successResponse(banner, "Banner created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/banners error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update banner
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
      return errorResponse(400, "Banner ID is required");
    }

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Banner not found");
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.startAt !== undefined) updateData.startAt = data.startAt ? new Date(data.startAt) : null;
    if (data.endAt !== undefined) updateData.endAt = data.endAt ? new Date(data.endAt) : null;

    const banner = await db.banner.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "banner", String(banner.id), ip, existing, banner);

    return successResponse(banner, "Banner updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/banners error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete banner
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
      return errorResponse(400, "Banner ID is required");
    }

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Banner not found");
    }

    await db.banner.delete({ where: { id } });

    await createAuditLog(userId, "delete", "banner", String(id), ip, existing, null);

    return successResponse(null, "Banner deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/banners error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}