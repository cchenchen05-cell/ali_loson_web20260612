"use client";

import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[120px] md:text-[180px] font-bold text-muted/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-10 w-10 text-primary/50" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-2">页面未找到</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在。可能已被移除，或者链接地址有误。
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              浏览产品
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}