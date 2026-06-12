import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
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

interface CategoryNode {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  previewImage: string | null;
  description: string | null;
  sortOrder: number;
  children: CategoryNode[];
  _count?: { products: number };
  createdAt: Date;
  updatedAt: Date;
}

// GET: List categories as tree
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const allCategories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    const roots = allCategories.filter((c) => c.parentId === null);
    const childrenMap = new Map<number, typeof allCategories>();

    for (const cat of allCategories) {
      if (cat.parentId !== null) {
        const siblings = childrenMap.get(cat.parentId) || [];
        siblings.push(cat);
        childrenMap.set(cat.parentId, siblings);
      }
    }

    const buildTree = (parents: typeof allCategories): CategoryNode[] => {
      return parents.map((cat) => ({
        ...cat,
        icon: cat.icon ?? null,
        image: cat.image ?? null,
        previewImage: cat.previewImage ?? null,
        description: cat.description ?? null,
        children: buildTree(childrenMap.get(cat.id) || []),
      }));
    };

    const tree = buildTree(roots);
    return successResponse(tree);
  } catch (error) {
    console.error("GET /api/v1/admin/categories error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}

// POST: Create category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    const userId = parseInt((session.user as any).id, 10);
    const ip = getIpAddress(request);

    const body = await request.json();
    const { parentId, name, slug, icon, image, previewImage, description, sortOrder } = body;

    if (!name || !slug) {
      return errorResponse(400, "Name and slug are required");
    }

    const category = await db.category.create({
      data: {
        parentId: parentId ? parseInt(parentId, 10) : null,
        name,
        slug,
        icon: icon ?? null,
        image: image ?? null,
        previewImage: previewImage ?? null,
        description: description ?? null,
        sortOrder: sortOrder || 0,
      },
    });

    await createAuditLog(userId, "create", "category", String(category.id), ip, null, category);

    return successResponse(category, "Category created successfully");
  } catch (error) {
    console.error("POST /api/v1/admin/categories error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A category with this slug already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// PUT: Update category
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
      return errorResponse(400, "Category ID is required");
    }

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Category not found");
    }

    const updateData: any = {};
    if (data.parentId !== undefined) updateData.parentId = data.parentId ? parseInt(data.parentId, 10) : null;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.previewImage !== undefined) updateData.previewImage = data.previewImage;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Prevent circular reference: a category cannot have itself or its descendants as parent
    if (updateData.parentId && updateData.parentId === id) {
      return errorResponse(400, "A category cannot be its own parent");
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(userId, "update", "category", String(category.id), ip, existing, category);

    return successResponse(category, "Category updated successfully");
  } catch (error) {
    console.error("PUT /api/v1/admin/categories error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(409, "A category with this slug already exists");
      }
    }
    return errorResponse(500, "Internal Server Error");
  }
}

// DELETE: Delete category (check for children)
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
      return errorResponse(400, "Category ID is required");
    }

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(404, "Category not found");
    }

    // Check for children
    const childCount = await db.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return errorResponse(400, "Cannot delete category with subcategories. Remove child categories first.");
    }

    // Check for products
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return errorResponse(400, "Cannot delete category with products. Move or delete products first.");
    }

    await db.category.delete({ where: { id } });

    await createAuditLog(userId, "delete", "category", String(id), ip, existing, null);

    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    console.error("DELETE /api/v1/admin/categories error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}