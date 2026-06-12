"use client";

import * as React from "react";
import { useParams } from "next/navigation";

type Locale = string;

export function useLanguage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "zh";

  const isZh = locale === "zh";
  const isEn = locale === "en";

  const t = React.useCallback(
    (zhText: string, enText?: string) => {
      return locale === "zh" ? zhText : (enText || zhText);
    },
    [locale]
  );

  return { locale, isZh, isEn, t };
}