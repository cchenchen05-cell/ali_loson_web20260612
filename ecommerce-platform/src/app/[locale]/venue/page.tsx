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
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">场地设计展示</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            查看我们为客户设计的精美场地，为您的电玩城提供设计灵感
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b bg-background sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>暂无场地设计</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue, idx) => (
              <div
                key={venue.id}
                className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setFullscreenIndex(idx);
                  setFullscreenImageIdx(0);
                }}
              >
                {venue.images && venue.images.length > 0 ? (
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                      src={venue.images[0]}
                      alt={venue.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {venue.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
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
                <div className="p-4">
                  <h3 className="font-semibold">{venue.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <h3 className="font-semibold text-lg">
              {filteredVenues[fullscreenIndex]?.title}
            </h3>
            <button
              onClick={() => setFullscreenIndex(null)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
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
                    className="absolute left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() =>
                      setFullscreenImageIdx((prev) =>
                        prev < filteredVenues[fullscreenIndex].images.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
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