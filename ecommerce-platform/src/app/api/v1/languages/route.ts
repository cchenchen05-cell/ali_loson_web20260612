import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const languages = [
    { code: "zh", name: "中文", nativeName: "中文" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "العربية", nativeName: "العربية" },
    { code: "es", name: "Español", nativeName: "Español" },
    { code: "fr", name: "Français", nativeName: "Français" },
    { code: "ru", name: "Русский", nativeName: "Русский" },
  ];
  return successResponse(languages);
}