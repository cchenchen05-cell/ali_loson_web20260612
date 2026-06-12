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
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

function generateRandomPassword(length = 16): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// GET: List users (superadmin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (userRole !== "superadmin") {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || undefined;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [list, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          firstLogin: true,
          lastLoginAt: true,
          lastLoginIp: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.user.count({ where }),
    ]);

    const cleanedList = list.map((u) => ({
      ...u,
      lastLoginAt: u.lastLoginAt ?? null,
      lastLoginIp: u.lastLoginIp ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/users error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create user (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (userRole !== "superadmin") {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { username, email, role, isActive } = body;

    if (!username || !email) {
      return errorResponse(400, "Username and email are required");
    }

    const password = generateRandomPassword(16);
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: role || "editor",
        isActive: isActive !== undefined ? isActive : true,
        firstLogin: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        firstLogin: true,
        createdAt: true,
      },
    });

    await createAuditLog(userId, "create", "user", String(user.id), ip, null, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      { ...user, generatedPassword: password },
      "User created successfully"
    );
  } catch (error) {
    console.error("POST /api/v1/admin/users error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A user with this username or email already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update user (superadmin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (userRole !== "superadmin") {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse(400, "User ID is required");
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "User not found");
    }

    const updateData: any = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.resetPassword) {
      const password = generateRandomPassword(16);
      updateData.passwordHash = await bcrypt.hash(password, 12);
      updateData.firstLogin = true;
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        firstLogin: true,
        updatedAt: true,
      },
    });

    await createAuditLog(userId, "update", "user", String(user.id), ip, existing, user);

    return successResponse(user, "User updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/users error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A user with this username or email already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete user (superadmin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (userRole !== "superadmin") {
      return errorResponse(403, "Forbidden: superadmin only");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get("id") || "", 10);

    if (isNaN(id)) {
      return errorResponse(400, "User ID is required");
    }

    if (id === userId) {
      return errorResponse(400, "Cannot delete your own account");
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "User not found");
    }

    await db.user.delete({ where: { id } });

    await createAuditLog(userId, "delete", "user", String(id), ip, existing, null);

    return successResponse(null, "User deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/users error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}