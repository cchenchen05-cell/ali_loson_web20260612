"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { VenueDesign } from "@/types";

const filterTabs = [
  { key: "all", label: "全部" },
  { key: "arcade", label: "电玩城" },
  { key: "kids", label: "儿童乐园" },
  { key: "family", label: "家庭娱乐中心" },
  { key: "theme-park", label: "主题公园" },
  { key: "vr-zone", label: "VR体验区" },
];

export default function VenuePage() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [venues, setVenues] = React.useState<VenueDesign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [fullscreenIndex, setFullscreenIndex] = React.useState<number | null>(null);
  const [fullscreenImageIdx, setFullscreenImageIdx] = React.useState(0);

  React.useEffect(() => {
    async function fetchVenues() {
      setLoading(true);
      try {
        const res = await api.get<{ list: VenueDesign[] }>(
          `/api/v1/venues?category=${activeTab !== "all" ? activeTab : ""}`
        );
        setVenues(res.data?.list || []);
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, [activeTab]);

  const filteredVenues =
    activeTab === "all"
      ? venues
      : venues.filter((v) => v.category === activeTab);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden py-16 md:py-24">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* 玻璃装饰元素 */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="glass-card max-w-2xl mx-auto p-8 rounded-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              场地设计展示
            </h1>
            <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg">
              查看我们为客户设计的精美场地，为您的电玩城提供设计灵感
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-white/10 glass sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                  activeTab === tab.key
                    ? "glass border border-primary/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass-card max-w-md mx-auto p-8 rounded-2xl">
              <p className="text-white/60">暂无场地设计</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue, idx) => (
              <div
                key={venue.id}
                className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer glass-card"
                onClick={() => {
                  setFullscreenIndex(idx);
                  setFullscreenImageIdx(0);
                }}
              >
                {venue.images && venue.images.length > 0 ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={venue.images[0]}
                      alt={venue.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {venue.images.length > 1 && (
                      <div className="absolute top-3 right-3 glass text-white text-xs px-3 py-1 rounded-full">
                        {venue.images.length} 张
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary/30">
                      {venue.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {venue.title}
                  </h3>
                  <p className="text-sm text-white/60 mt-2 line-clamp-2">
                    {venue.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Viewer */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white glass border-b border-white/10">
            <h3 className="font-semibold text-lg">
              {filteredVenues[fullscreenIndex]?.title}
            </h3>
            <button
              onClick={() => setFullscreenIndex(null)}
              className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Image */}
          {filteredVenues[fullscreenIndex]?.images && (
            <div className="flex-1 relative flex items-center justify-center">
              <Image
                src={
                  filteredVenues[fullscreenIndex].images[fullscreenImageIdx] ||
                  "/placeholder-product.svg"
                }
                alt={filteredVenues[fullscreenIndex].title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />

              {filteredVenues[fullscreenIndex].images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setFullscreenImageIdx((prev) =>
                        prev > 0 ? prev - 1 : filteredVenues[fullscreenIndex].images.length - 1
                      )
                    }
                    className="absolute left-4 p-3 rounded-full glass hover:bg-white/10 text-white transition-all hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() =>
                      setFullscreenImageIdx((prev) =>
                        prev < filteredVenues[fullscreenIndex].images.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-4 p-3 rounded-full glass hover:bg-white/10 text-white transition-all hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Thumbnails */}
          {filteredVenues[fullscreenIndex]?.images &&
            filteredVenues[fullscreenIndex].images.length > 1 && (
              <div className="flex justify-center gap-2 p-4 overflow-x-auto">
                {filteredVenues[fullscreenIndex].images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setFullscreenImageIdx(i)}
                    className={cn(
                      "relative w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 transition-all",
                      i === fullscreenImageIdx
                        ? "border-white"
                        : "border-white/30 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${filteredVenues[fullscreenIndex].title} ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}