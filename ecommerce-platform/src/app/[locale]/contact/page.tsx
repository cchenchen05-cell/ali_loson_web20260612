"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home, MapPin, Phone, Mail, Clock } from "lucide-react";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="glass border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">联系我们</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">联系我们</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            无论您有任何采购需求或合作意向，我们随时欢迎您联系
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Contact Form */}
          <div>
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6">发送消息</h2>
              <InquiryForm locale="zh" />
            </div>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">联系方式</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">公司地址</h3>
                    <p className="text-sm text-muted-foreground">
                      广东省广州市番禺区星力动漫产业园
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Xingli Animation Industry Park, Panyu District, Guangzhou, China
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">联系电话</h3>
                    <p className="text-sm text-muted-foreground">+86 400-123-4567</p>
                    <p className="text-sm text-muted-foreground">+86 20-1234-5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">电子邮箱</h3>
                    <p className="text-sm text-muted-foreground">info@example.com</p>
                    <p className="text-sm text-muted-foreground">sales@example.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">工作时间</h3>
                    <p className="text-sm text-muted-foreground">周一至周五：9:00 - 18:00</p>
                    <p className="text-sm text-muted-foreground">周六：9:00 - 12:00</p>
                    <p className="text-sm text-muted-foreground">周日：休息</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">公司位置</h2>
              <div className="aspect-video rounded-xl glass flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">地图加载区域</p>
                  <p className="text-xs mt-1">集成 Google Maps / 高德地图</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}