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

// GET: List announcements
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);

    const [list, total] = await Promise.all([
      db.announcement.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      }),
      db.announcement.count(),
    ]);

    const cleanedList = list.map((a) => ({
      ...a,
      startAt: a.startAt ?? null,
      endAt: a.endAt ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/announcements error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create announcement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { content, isPinned, startAt, endAt } = body;

    if (!content) {
      return errorResponse(400, "Content is required");
    }

    const announcement = await db.announcement.create({
      data: {
        content,
        isPinned: isPinned || false,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });

    await createAuditLog(userId, "create", "announcement", String(announcement.id), ip, null, announcement);

    return successResponse(announcement, "Announcement created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/announcements error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update announcement
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
      return errorResponse(400, "Announcement ID is required");
    }

    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Announcement not found");
    }

    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    if (data.startAt !== undefined) updateData.startAt = data.startAt ? new Date(data.startAt) : null;
    if (data.endAt !== undefined) updateData.endAt = data.endAt ? new Date(data.endAt) : null;

    const announcement = await db.announcement.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "announcement", String(announcement.id), ip, existing, announcement);

    return successResponse(announcement, "Announcement updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/announcements error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete announcement
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
      return errorResponse(400, "Announcement ID is required");
    }

    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Announcement not found");
    }

    await db.announcement.delete({ where: { id } });

    await createAuditLog(userId, "delete", "announcement", String(id), ip, existing, null);

    return successResponse(null, "Announcement deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/announcements error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}