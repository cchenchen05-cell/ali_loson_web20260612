"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { cn } from "@/components/ui/utils";

interface InquiryFormValues {
  name: string;
  phone: string;
  email: string;
  budget: string;
  purchaseTime: string;
  address: string;
  message: string;
  productIds: string;
}

interface InquiryFormProps {
  locale: string;
  preSelectedProductIds?: number[];
  className?: string;
}

const STORAGE_KEY = "inquiry_draft";
const FORM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function loadDraft(): Partial<InquiryFormValues> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > FORM_CACHE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return data || {};
  } catch {
    return {};
  }
}

function saveDraft(data: Partial<InquiryFormValues>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // storage full or unavailable
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const budgetOptions = [
  { value: "", label: "" },
  { value: "below-1000", label: "< $1,000" },
  { value: "1000-5000", label: "$1,000 - $5,000" },
  { value: "5000-10000", label: "$5,000 - $10,000" },
  { value: "10000-50000", label: "$10,000 - $50,000" },
  { value: "above-50000", label: "> $50,000" },
];

const purchaseTimeOptions = [
  { value: "", label: "" },
  { value: "within-1-week", label: "Within 1 week" },
  { value: "within-1-month", label: "Within 1 month" },
  { value: "within-3-months", label: "Within 3 months" },
  { value: "within-6-months", label: "Within 6 months" },
  { value: "no-rush", label: "No rush" },
];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[\d\s\-+()]{7,20}$/.test(phone);
}

export function InquiryForm({ locale, preSelectedProductIds, className }: InquiryFormProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<InquiryFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      budget: "",
      purchaseTime: "",
      address: "",
      message: "",
      productIds: "",
    },
  });

  const budgetValue = watch("budget");
  const purchaseTimeValue = watch("purchaseTime");

  // Load draft on mount
  React.useEffect(() => {
    const draft = loadDraft();
    if (draft.name) setValue("name", draft.name);
    if (draft.phone) setValue("phone", draft.phone);
    if (draft.email) setValue("email", draft.email);
    if (draft.address) setValue("address", draft.address);
    if (draft.message) setValue("message", draft.message);
    if (draft.budget) setValue("budget", draft.budget);
    if (draft.purchaseTime) setValue("purchaseTime", draft.purchaseTime);
  }, [setValue]);

  // Pre-select product IDs
  React.useEffect(() => {
    if (preSelectedProductIds && preSelectedProductIds.length > 0) {
      setValue("productIds", preSelectedProductIds.join(","));
    }
  }, [preSelectedProductIds, setValue]);

  // Auto-save draft
  const formValues = watch();
  React.useEffect(() => {
    const timer = setInterval(() => {
      saveDraft({
        name: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        budget: formValues.budget,
        purchaseTime: formValues.purchaseTime,
        address: formValues.address,
        message: formValues.message,
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [formValues]);

  // Show toast
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const validate = (data: InquiryFormValues): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      newErrors.name = locale === "zh" ? "请输入姓名" : "Name is required";
    }
    if (!data.phone.trim()) {
      newErrors.phone = locale === "zh" ? "请输入电话" : "Phone is required";
    } else if (!validatePhone(data.phone.trim())) {
      newErrors.phone = locale === "zh" ? "请输入有效的电话号码" : "Please enter a valid phone number";
    }
    if (data.email.trim() && !validateEmail(data.email.trim())) {
      newErrors.email = locale === "zh" ? "请输入有效的邮箱地址" : "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data: InquiryFormValues) => {
    if (!validate(data)) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/inquiries", {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim() || undefined,
        budget: data.budget || undefined,
        purchaseTime: data.purchaseTime || undefined,
        address: data.address.trim() || undefined,
        message: data.message.trim() || undefined,
        productIds: data.productIds || undefined,
      });

      showToast(
        "success",
        locale === "zh"
          ? "询价提交成功，我们会尽快联系您！"
          : "Inquiry submitted successfully! We will contact you soon!"
      );

      // Clear form and draft
      reset();
      clearDraft();
    } catch {
      showToast(
        "error",
        locale === "zh"
          ? "提交失败，请稍后重试"
          : "Submission failed, please try again later"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const translations = {
    title: locale === "zh" ? "询价表单" : "Inquiry Form",
    name: locale === "zh" ? "姓名" : "Name",
    namePlaceholder: locale === "zh" ? "请输入您的姓名" : "Enter your name",
    phone: locale === "zh" ? "电话" : "Phone",
    phonePlaceholder: locale === "zh" ? "请输入您的联系电话" : "Enter your phone number",
    email: locale === "zh" ? "邮箱" : "Email",
    emailPlaceholder: locale === "zh" ? "请输入您的邮箱" : "Enter your email",
    budget: locale === "zh" ? "预算" : "Budget",
    budgetPlaceholder: locale === "zh" ? "请选择预算范围" : "Select budget range",
    purchaseTime: locale === "zh" ? "采购时间" : "Purchase Time",
    purchaseTimePlaceholder: locale === "zh" ? "请选择预计采购时间" : "Select expected purchase time",
    address: locale === "zh" ? "收货地址" : "Shipping Address",
    addressPlaceholder: locale === "zh" ? "请输入收货地址" : "Enter shipping address",
    message: locale === "zh" ? "采购需求描述" : "Purchase Requirements",
    messagePlaceholder: locale === "zh" ? "请描述您的采购需求" : "Describe your purchase requirements",
    submit: locale === "zh" ? "提交询价" : "Submit Inquiry",
    submitting: locale === "zh" ? "提交中..." : "Submitting...",
    turnstile: locale === "zh" ? "人机验证 (Cloudflare Turnstile)" : "Verification (Cloudflare Turnstile)",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-20 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2",
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-destructive text-destructive-foreground"
          )}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {translations.title && (
          <h3 className="text-lg font-semibold mb-4">{translations.title}</h3>
        )}

        {/* Name */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.name} <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder={translations.namePlaceholder}
            {...register("name")}
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.phone} <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder={translations.phonePlaceholder}
            {...register("phone")}
            className={cn(errors.phone && "border-destructive")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.email}
          </label>
          <Input
            type="email"
            placeholder={translations.emailPlaceholder}
            {...register("email")}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.budget}
          </label>
          <Select
            value={budgetValue}
            onChange={(v) => setValue("budget", v)}
            options={budgetOptions}
            placeholder={translations.budgetPlaceholder}
          />
        </div>

        {/* Purchase Time */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.purchaseTime}
          </label>
          <Select
            value={purchaseTimeValue}
            onChange={(v) => setValue("purchaseTime", v)}
            options={purchaseTimeOptions}
            placeholder={translations.purchaseTimePlaceholder}
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.address}
          </label>
          <Input
            placeholder={translations.addressPlaceholder}
            {...register("address")}
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {translations.message}
          </label>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={translations.messagePlaceholder}
            {...register("message")}
          />
        </div>

        {/* Turnstile Placeholder */}
        <div>
          <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
            <svg className="h-8 w-8 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>{translations.turnstile}</span>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {translations.submitting}
            </>
          ) : (
            translations.submit
          )}
        </Button>
      </form>
    </div>
  );
}