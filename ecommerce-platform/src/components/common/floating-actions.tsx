"use client";

import * as React from "react";
import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

interface FloatingActionsProps {
  onToggleFavorites?: () => void;
  onOpenInquiry?: () => void;
  phoneNumber?: string;
  locale?: string;
}

export function FloatingActions({ onToggleFavorites, onOpenInquiry, phoneNumber = "+86 400-123-4567", locale = "zh" }: FloatingActionsProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col gap-2">
      {/* Back to Top */}
      {visible && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Phone */}
      <a
        href={`tel:${phoneNumber}`}
        className="w-10 h-10 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 transition-all"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* Inquiry */}
      {onOpenInquiry && (
        <button
          onClick={onOpenInquiry}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}