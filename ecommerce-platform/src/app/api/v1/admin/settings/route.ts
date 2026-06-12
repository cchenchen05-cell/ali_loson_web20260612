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

function checkSuperadmin(session: any): boolean {
  return (session.user as any).role === "superadmin";
}

// GET: List settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const searchParams = request.nextUrl.searchParams;
    const group = searchParams.get("group") || undefined;

    const where: Prisma.SettingWhereInput = {};
    if (group) where.group = group;

    const settings = await db.setting.findMany({
      where,
      orderBy: { group: "asc" },
    });

    const cleanedSettings = settings.map((s) => ({
      ...s,
      value: s.value ?? null,
      group: s.group ?? null,
    }));

    return successResponse(cleanedSettings);
  } catch (error) {
    console.error("GET /api/v1/admin/settings error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create setting (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    if (!checkSuperadmin(session)) {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { key, value, group } = body;

    if (!key) {
      return errorResponse(400, "Key is required");
    }

    const setting = await db.setting.create({
      data: {
        key,
        value: value ?? null,
        group: group ?? null,
      },
    });

    await createAuditLog(userId, "create", "setting", String(setting.id), ip, null, setting);

    return successResponse(setting, "Setting created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/settings error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A setting with this key already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update setting (superadmin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    if (!checkSuperadmin(session)) {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse(400, "Setting ID is required");
    }

    const existing = await db.setting.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Setting not found");
    }

    const updateData: any = {};
    if (data.key !== undefined) updateData.key = data.key;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.group !== undefined) updateData.group = data.group;

    const setting = await db.setting.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "setting", String(setting.id), ip, existing, setting);

    return successResponse(setting, "Setting updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/settings error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A setting with this key already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete setting (superadmin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    if (!checkSuperadmin(session)) {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get("id") || "", 10);

    if (isNaN(id)) {
      return errorResponse(400, "Setting ID is required");
    }

    const existing = await db.setting.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Setting not found");
    }

    await db.setting.delete({ where: { id } });

    await createAuditLog(userId, "delete", "setting", String(id), ip, existing, null);

    return successResponse(null, "Setting deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/settings error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}