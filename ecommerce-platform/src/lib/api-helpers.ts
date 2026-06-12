import { NextRequest, NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginatedData<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function successResponse<T>(data: T, message = "Success"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: 200,
    message,
    data,
    timestamp: Date.now(),
  });
}

export function errorResponse(
  code: number,
  message: string,
  status?: number
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    },
    { status: status ?? code }
  );
}

export function paginatedResponse<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<ApiResponse<PaginatedData<T>>> {
  return NextResponse.json({
    code: 200,
    message: "Success",
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    timestamp: Date.now(),
  });
}

export function getPaginationParams(request: NextRequest): {
  page: number;
  pageSize: number;
} {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "40", 10) || 40)
  );
  return { page, pageSize };
}

export function getIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "127.0.0.1";
}