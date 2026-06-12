"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImageViewer({ images, initialIndex = 0, open, onClose, alt = "" }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((p) => (p > 0 ? p - 1 : images.length - 1));
      if (e.key === "ArrowRight") setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : 0));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm">{currentIndex + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <Image
          src={images[currentIndex] || "/placeholder-product.svg"}
          alt={alt}
          fill
          className="object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
          sizes="100vw"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((p) => (p > 0 ? p - 1 : images.length - 1))}
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : 0))}
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 p-4 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 transition-all",
                i === currentIndex ? "border-white" : "border-white/30 opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img} alt={alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}