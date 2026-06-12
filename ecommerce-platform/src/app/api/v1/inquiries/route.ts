import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { successResponse, errorResponse, getIpAddress } from "@/lib/api-helpers";

function generateInquiryNo(lastNo: string | null): string {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  let sequence = 1;
  if (lastNo) {
    const parts = lastNo.split("-");
    if (parts.length === 3 && parts[0] === "INQ" && parts[1] === dateStr) {
      sequence = parseInt(parts[2], 10) + 1;
    }
  }

  return `INQ-${dateStr}-${String(sequence).padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 per minute per IP
    const ip = getIpAddress(request);
    const rateLimitKey = `inquiry:${ip}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 3, 60);

    if (!rateLimitResult.allowed) {
      return errorResponse(429, "Too many requests, please try again later");
    }

    const body = await request.json();
    const { name, phone, email, budget, purchaseTime, address, message, productIds } = body;

    // Validation
    if (!name || !phone || !email) {
      return errorResponse(400, "Name, phone, and email are required");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(400, "Invalid email format");
    }

    // Generate inquiry number
    const lastInquiry = await db.inquiry.findFirst({
      where: {
        inquiryNo: { startsWith: "INQ-" },
      },
      orderBy: { createdAt: "desc" },
    });

    const inquiryNo = generateInquiryNo(lastInquiry?.inquiryNo ?? null);

    const inquiry = await db.inquiry.create({
      data: {
        inquiryNo,
        name,
        phone,
        email,
        budget: budget ?? null,
        purchaseTime: purchaseTime ?? null,
        address: address ?? null,
        message: message ?? null,
        productIds: productIds ? JSON.stringify(productIds) : null,
        visitorId: body.visitorId ?? null,
        ipAddress: ip,
        status: "pending",
      },
    });

    return successResponse(inquiry, "Inquiry submitted successfully");
  } catch (error) {
    console.error("POST /api/v1/inquiries error:", error);
    return errorResponse(500, "Internal Server Error");
  }
}