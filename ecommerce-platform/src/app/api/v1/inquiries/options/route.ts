import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const options = {
    budget: [
      { value: "below-1000", label: "< $1,000" },
      { value: "1000-5000", label: "$1,000 - $5,000" },
      { value: "5000-10000", label: "$5,000 - $10,000" },
      { value: "10000-50000", label: "$10,000 - $50,000" },
      { value: "above-50000", label: "> $50,000" },
    ],
    purchaseTime: [
      { value: "within-1-week", label: "Within 1 week" },
      { value: "within-1-month", label: "Within 1 month" },
      { value: "within-3-months", label: "Within 3 months" },
      { value: "within-6-months", label: "Within 6 months" },
      { value: "no-rush", label: "No rush" },
    ],
  };
  return successResponse(options);
}