"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Home, Factory, Warehouse, Cpu, Wrench, X } from "lucide-react";
import { Card } from "@/components/ui/card";

const factoryAreas = [
  {
    id: 1,
    title: "生产车间",
    description: "现代化生产流水线，年产能超50,000台设备",
    imageUrl: "/placeholder-product.svg",
    icon: Factory,
  },
  {
    id: 2,
    title: "仓储物流",
    description: "超过3,000平方米智能化仓库，高效物流配送",
    imageUrl: "/placeholder-product.svg",
    icon: Warehouse,
  },
  {
    id: 3,
    title: "研发中心",
    description: "30+专业研发工程师，持续技术创新",
    imageUrl: "/placeholder-product.svg",
    icon: Cpu,
  },
  {
    id: 4,
    title: "质检中心",
    description: "严格的质量检测流程，确保每一台设备品质",
    imageUrl: "/placeholder-product.svg",
    icon: Wrench,
  },
];

const factoryImages = [
  { src: "/placeholder-product.svg", title: "生产流水线" },
  { src: "/placeholder-product.svg", title: "组装车间" },
  { src: "/placeholder-product.svg", title: "仓储区域" },
  { src: "/placeholder-product.svg", title: "研发实验室" },
  { src: "/placeholder-product.svg", title: "产品展示厅" },
  { src: "/placeholder-product.svg", title: "检测中心" },
  { src: "/placeholder-product.svg", title: "员工培训中心" },
  { src: "/placeholder-product.svg", title: "出货区" },
];

export default function FactoryPage() {
  const [fullscreen, setFullscreen] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/about/intro" className="hover:text-foreground transition-colors">
              关于我们
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">工厂展示</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">工厂展示</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            走进我们的现代化生产基地，了解电玩设备的生产过程
          </p>
        </div>
      </div>

      {/* Featured Areas */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {factoryAreas.map((area) => {
            const Icon = area.icon;
            return (
              <Card key={area.id} className="overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={area.imageUrl}
                    alt={area.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{area.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">工厂实景</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {factoryImages.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                onClick={() => setFullscreen(i)}
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreen !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreen(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setFullscreen(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={factoryImages[fullscreen].src}
              alt={factoryImages[fullscreen].title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          <div className="absolute bottom-6 text-white text-center">
            <p className="text-lg font-medium">{factoryImages[fullscreen].title}</p>
          </div>
        </div>
      )}
    </div>
  );
}