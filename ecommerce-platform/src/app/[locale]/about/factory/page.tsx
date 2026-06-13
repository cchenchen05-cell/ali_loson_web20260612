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
      <div className="glass border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-white/60">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/about/intro" className="hover:text-white transition-colors">
              关于我们
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">工厂展示</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="glass-card max-w-2xl mx-auto p-8 rounded-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              工厂展示
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              走进我们的现代化生产基地，了解电玩设备的生产过程
            </p>
          </div>
        </div>
      </div>

      {/* Featured Areas */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {factoryAreas.map((area) => {
            const Icon = area.icon;
            return (
              <div key={area.id} className="glass-card rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={area.imageUrl}
                    alt={area.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-white">{area.title}</h3>
                  </div>
                  <p className="text-sm text-white/60">{area.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gallery */}
      <div className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            工厂实景
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {factoryImages.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer glass-card hover:scale-105 transition-all duration-300"
                onClick={() => setFullscreen(i)}
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
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
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setFullscreen(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white/10 text-white transition-colors"
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