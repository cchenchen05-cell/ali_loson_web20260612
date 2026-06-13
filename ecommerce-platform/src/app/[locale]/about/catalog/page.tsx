"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Home, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const catalogItems = [
  {
    title: "拳击机系列",
    coverUrl: "/placeholder-product.svg",
    description: "多款拳击机产品，适合不同场地需求",
  },
  {
    title: "娃娃机系列",
    coverUrl: "/placeholder-product.svg",
    description: "丰富多样的娃娃机，高营收利器",
  },
  {
    title: "赛车机系列",
    coverUrl: "/placeholder-product.svg",
    description: "动感赛车模拟器，极致体验",
  },
  {
    title: "VR设备系列",
    coverUrl: "/placeholder-product.svg",
    description: "前沿VR技术，沉浸式娱乐",
  },
  {
    title: "射击游戏系列",
    coverUrl: "/placeholder-product.svg",
    description: "多种射击游戏，紧张刺激",
  },
  {
    title: "彩票机系列",
    coverUrl: "/placeholder-product.svg",
    description: "高回报彩票机，稳定营收",
  },
  {
    title: "投篮机系列",
    coverUrl: "/placeholder-product.svg",
    description: "经典投篮机，全民娱乐",
  },
  {
    title: "儿童设备系列",
    coverUrl: "/placeholder-product.svg",
    description: "安全有趣的儿童游乐设备",
  },
];

export default function CatalogPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="glass border-b border-white/5">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-white/50">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/about/intro" className="hover:text-white transition-colors">
              关于我们
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">产品画册</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="glass-card max-w-2xl mx-auto p-8 rounded-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              产品画册
            </h1>
            <p className="text-white/70 max-w-xl mx-auto mb-6">
              浏览我们的产品系列，了解各类电玩设备的详细信息
            </p>
            <Button variant="outline" size="lg" className="gap-2 glass border-white/10 text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
              下载完整画册 (PDF)
            </Button>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalogItems.map((item, i) => (
            <Link
              key={i}
              href={`/products?category=${encodeURIComponent(item.title)}`}
              className="group glass-card rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  <p className="text-white/60 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}