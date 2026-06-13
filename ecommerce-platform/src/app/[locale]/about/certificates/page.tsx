"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Home, X } from "lucide-react";

const certificates = [
  {
    id: 1,
    title: "ISO 9001:2015",
    subtitle: "质量管理体系认证",
    imageUrl: "/placeholder-product.svg",
    description: "国际标准化组织质量管理体系认证，确保产品和服务质量的持续改进。",
  },
  {
    id: 2,
    title: "CE 认证",
    subtitle: "欧盟安全认证",
    imageUrl: "/placeholder-product.svg",
    description: "产品符合欧盟安全、健康和环保要求，可自由进入欧洲市场。",
  },
  {
    id: 3,
    title: "FCC 认证",
    subtitle: "美国联邦通信委员会认证",
    imageUrl: "/placeholder-product.svg",
    description: "产品电磁兼容性符合美国标准，确保设备稳定运行。",
  },
  {
    id: 4,
    title: "RoHS 认证",
    subtitle: "有害物质限制认证",
    imageUrl: "/placeholder-product.svg",
    description: "产品符合环保要求，限制使用有害物质，绿色环保。",
  },
  {
    id: 5,
    title: "实用新型专利",
    subtitle: "多项技术专利",
    imageUrl: "/placeholder-product.svg",
    description: "拥有多项实用新型专利技术，保护自主知识产权。",
  },
  {
    id: 6,
    title: "外观设计专利",
    subtitle: "产品外观专利",
    imageUrl: "/placeholder-product.svg",
    description: "独特的产品外观设计，提升品牌辨识度和市场竞争力。",
  },
];

export default function CertificatesPage() {
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
            <span className="text-white font-medium">证书展示</span>
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
              资质证书
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              我们拥有多项国际认证和专利技术，品质值得信赖
            </p>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group glass-card rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setFullscreen(cert.id)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={cert.imageUrl}
                  alt={cert.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium glass px-4 py-2 rounded-full">
                    点击查看详情
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white">{cert.title}</h3>
                <p className="text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium">
                  {cert.subtitle}
                </p>
                <p className="text-sm text-white/60 mt-2 line-clamp-2">
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
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
          <div
            className="relative max-w-2xl w-full glass-card rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {certificates
              .filter((c) => c.id === fullscreen)
              .map((cert) => (
                <div key={cert.id}>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={cert.imageUrl}
                      alt={cert.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white">{cert.title}</h2>
                    <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium">
                      {cert.subtitle}
                    </p>
                    <p className="text-white/70 mt-4">{cert.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}