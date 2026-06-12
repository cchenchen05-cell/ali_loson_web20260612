"use client";

import * as React from "react";
import { api } from "@/lib/api";

interface InquiryData {
  name: string;
  phone: string;
  email?: string;
  budget?: string;
  purchaseTime?: string;
  address?: string;
  message?: string;
  productIds?: string;
}

export function useInquiry() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitInquiry = async (data: InquiryData): Promise<{ success: boolean; message: string }> => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/v1/inquiries", data);
      if (res.code === 0) {
        return { success: true, message: res.message || "Submission successful" };
      }
      return { success: false, message: res.message || "Submission failed" };
    } catch {
      return { success: false, message: "Network error, please try again" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitInquiry, isSubmitting };
}