import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
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

// GET: List products
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const { page, pageSize } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!, 10)
      : undefined;
    const status = searchParams.get("status") || undefined;
    const sort = searchParams.get("sort") || "latest";

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.name = { contains: search };
    }
    if (categoryId && !isNaN(categoryId)) {
      where.categoryId = categoryId;
    }
    if (status) {
      where.status = status;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "comprehensive":
        orderBy = { sortOrder: "asc" };
        break;
      case "latest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [list, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          creator: { select: { id: true, username: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    const cleanedList = list.map((p) => ({
      ...p,
      subtitle: p.subtitle ?? null,
      description: p.description ?? null,
      summary: p.summary ?? null,
      coverImage: p.coverImage ?? null,
      images: p.images ?? null,
      price: p.price ?? null,
      specifications: p.specifications ?? null,
      seoTitle: p.seoTitle ?? null,
      seoDescription: p.seoDescription ?? null,
      seoKeywords: p.seoKeywords ?? null,
      translations: p.translations ?? null,
      publishedAt: p.publishedAt ?? null,
      creator: p.creator ?? null,
    }));

    return paginatedResponse(cleanedList, total, page, pageSize);
  } catch (error) {
    console.error("GET /api/v1/admin/products error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const {
      categoryId,
      name,
      slug,
      subtitle,
      description,
      summary,
      coverImage,
      images,
      price,
      status,
      featured,
      sortOrder,
      specifications,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    if (!categoryId || !name || !slug) {
      return errorResponse(400, "categoryId, name, and slug are required");
    }

    const product = await db.product.create({
      data: {
        categoryId: parseInt(categoryId, 10),
        createdBy: userId,
        name,
        slug,
        subtitle: subtitle ?? null,
        description: description ?? null,
        summary: summary ?? null,
        coverImage: coverImage ?? null,
        images: images ? JSON.stringify(images) : null,
        price: price ? parseFloat(price) : null,
        status: status || "draft",
        featured: featured || false,
        sortOrder: sortOrder || 0,
        specifications: specifications ? JSON.stringify(specifications) : null,
        seoTitle: seoTitle ?? null,
        seoDescription: seoDescription ?? null,
        seoKeywords: seoKeywords ?? null,
        publishedAt: status === "published" ? new Date() : null,
      },
    });

    await createAuditLog(userId, "create", "product", String(product.id), ip, null, product);

    return successResponse(product, "Product created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/products error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A product with this slug already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update product
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
      return errorResponse(400, "Product ID is required");
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Product not found");
    }

    const updateData: any = {};

    if (data.categoryId !== undefined) updateData.categoryId = parseInt(data.categoryId, 10);
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.price !== undefined) updateData.price = data.price != null ? parseFloat(data.price) : null;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "published" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.specifications !== undefined) updateData.specifications = JSON.stringify(data.specifications);
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "product", String(product.id), ip, existing, product);

    return successResponse(product, "Product updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/products error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A product with this slug already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete product
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
      return errorResponse(400, "Product ID is required");
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Product not found");
    }

    await db.product.delete({ where: { id } });

    await createAuditLog(userId, "delete", "product", String(id), ip, existing, null);

    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/products error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}