import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse(400, "No file provided");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(400, "Invalid file type. Allowed: jpeg, png, gif, webp, svg");
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse(400, "File too large. Max size: 10MB");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // In production, upload to cloud storage (S3/OSS). For now, save to local public/uploads
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;

    return successResponse({ url, filename, size: file.size, type: file.type, uploadedAt: new Date().toISOString() });
  } catch (error) {
    console.error("POST /api/v1/upload error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}