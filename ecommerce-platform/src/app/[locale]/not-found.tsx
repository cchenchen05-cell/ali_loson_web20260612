"use client";

import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      <div className="text-center px-4 relative z-10">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[120px] md:text-[180px] font-bold text-white/5 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center">
              <Search className="h-10 w-10 text-primary/70" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="glass-card max-w-md mx-auto p-6 rounded-2xl mt-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            页面未找到
          </h2>
          <p className="text-white/60 mb-6">
            抱歉，您访问的页面不存在。可能已被移除，或者链接地址有误。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90">
                <Home className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="gap-2 glass border-white/10 text-white hover:bg-white/10">
                <Search className="h-4 w-4" />
                浏览产品
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}