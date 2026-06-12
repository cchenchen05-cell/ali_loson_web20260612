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

// GET: List articles
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;

    const where: Prisma.ArticleWhereInput = {};
    if (search) {
      where.title = { contains: search };
    }
    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      db.article.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, username: true } },
        },
      }),
      db.article.count({ where }),
    ]);

    const cleanedList = list.map((a) => ({
      ...a,
      content: a.content ?? null,
      coverImage: a.coverImage ?? null,
      tags: a.tags ?? null,
      publishedAt: a.publishedAt ?? null,
      creator: a.creator ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/articles error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create article
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { title, slug, content, coverImage, tags, status } = body;

    if (!title || !slug) {
      return errorResponse(400, "Title and slug are required");
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        content: content ?? null,
        coverImage: coverImage ?? null,
        tags: tags ?? null,
        status: status || "draft",
        createdBy: userId,
        publishedAt: status === "published" ? new Date() : null,
      },
    });

    await createAuditLog(userId, "create", "article", String(article.id), ip, null, article);

    return successResponse(article, "Article created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/articles error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "An article with this slug already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update article
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
      return errorResponse(400, "Article ID is required");
    }

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Article not found");
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "published" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const article = await db.article.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "article", String(article.id), ip, existing, article);

    return successResponse(article, "Article updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/articles error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "An article with this slug already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete article
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
      return errorResponse(400, "Article ID is required");
    }

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Article not found");
    }

    await db.article.delete({ where: { id } });

    await createAuditLog(userId, "delete", "article", String(id), ip, existing, null);

    return successResponse(null, "Article deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/articles error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}