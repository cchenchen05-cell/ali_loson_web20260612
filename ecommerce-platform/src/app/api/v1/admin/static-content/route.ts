import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, getIpAddress } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

async function createAuditLog(
  userId: number, action: string, targetType: string, targetId: string,
  ipAddress: string, oldData?: any, newData?: any
) {
  await db.auditLog.create({
    data: {
      userId, action, targetType, targetId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      ipAddress,
    },
  });
}

// GET: List static contents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse(401, "Unauthorized");

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key") || undefined;

    const where: any = {};
    if (key) where.key = key;

    const [list, total] = await Promise.all([
      db.staticContent.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "asc" },
      }),
      db.staticContent.count({ where }),
    ]);

    const cleaned = list.map((s) => ({
      ...s,
      title: s.title ?? null,
      content: s.content ?? null,
      images: s.images ?? null,
    }));

    return paginatedResponse(cleaned, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/static-content error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create static content
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse(401, "Unauthorized");

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);
    const body = await request.json();
    const { key, title, content, images } = body;

    if (!key) return errorResponse(400, "Key is required");

    const item = await db.staticContent.create({
      data: {
        key,
        title: title ?? null,
        content: content ?? null,
        images: images ?? null,
      },
    });

    await createAuditLog(userId, "create", "static_content", String(item.id), ip, null, item);
    return successResponse(item, "Static content created");
  } catch (error) {
    console.error("POST /api/v1/admin/static-content error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse(409, "Static content with this key already exists");
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update static content
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse(401, "Unauthorized");

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return errorResponse(400, "ID is required");

    const existing = await db.staticContent.findUnique({ where: { id } });
    if (!existing) return errorResponse(404, "Static content not found");

    const updateData: any = {};
    if (data.key !== undefined) updateData.key = data.key;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.images !== undefined) updateData.images = data.images;

    const item = await db.staticContent.update({ where: { id }, data: updateData });
    await createAuditLog(userId, "update", "static_content", String(item.id), ip, existing, item);
    return successResponse(item, "Static content updated");
  } catch (error) {
    console.error("PUT /api/v1/admin/static-content error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete static content
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse(401, "Unauthorized");

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);
    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get("id") || "", 10);

    if (isNaN(id)) return errorResponse(400, "ID is required");

    const existing = await db.staticContent.findUnique({ where: { id } });
    if (!existing) return errorResponse(404, "Static content not found");

    await db.staticContent.delete({ where: { id } });
    await createAuditLog(userId, "delete", "static_content", String(id), ip, existing, null);
    return successResponse(null, "Static content deleted");
  } catch (error) {
    console.error("DELETE /api/v1/admin/static-content error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}