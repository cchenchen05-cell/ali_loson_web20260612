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

// GET: List inquiries with status filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || "";

    const where: Prisma.InquiryWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { inquiryNo: { contains: search } },
      ];
    }

    const [list, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      db.inquiry.count({ where }),
    ]);

    const cleanedList = list.map((i) => ({
      ...i,
      budget: i.budget ?? null,
      purchaseTime: i.purchaseTime ?? null,
      address: i.address ?? null,
      message: i.message ?? null,
      productIds: i.productIds ?? null,
      visitorId: i.visitorId ?? null,
      ipAddress: i.ipAddress ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/inquiries error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update inquiry status
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { id, status, ...data } = body;

    if (!id) {
      return errorResponse(400, "Inquiry ID is required");
    }

    const existing = await db.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Inquiry not found");
    }

    const validStatuses = ["pending", "processing", "completed", "closed"];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.purchaseTime !== undefined) updateData.purchaseTime = data.purchaseTime;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.message !== undefined) updateData.message = data.message;

    const inquiry = await db.inquiry.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(
      userId,
      status ? "status_change" : "update",
      "inquiry",
      String(inquiry.id),
      ip,
      existing,
      inquiry
    );

    return successResponse(inquiry, "Inquiry updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/inquiries error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}