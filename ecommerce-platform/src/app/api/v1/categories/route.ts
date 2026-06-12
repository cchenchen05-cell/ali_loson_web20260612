import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

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
}

export async function GET(request: NextRequest) {
  try {
    const allCategories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    // Build tree structure
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
        id: cat.id,
        parentId: cat.parentId,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon ?? null,
        image: cat.image ?? null,
        previewImage: cat.previewImage ?? null,
        description: cat.description ?? null,
        sortOrder: cat.sortOrder,
        children: buildTree(childrenMap.get(cat.id) || []),
      }));
    };

    const tree = buildTree(roots);

    return successResponse(tree);
  } catch (error) {
    console.error("GET /api/v1/categories error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}