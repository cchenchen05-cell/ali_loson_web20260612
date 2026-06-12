"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home, Award, Factory, Users, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const milestones = [
  { year: "2010", title: "公司成立", description: "在广州番禺成立，专注电玩设备研发" },
  { year: "2013", title: "产能扩张", description: "厂房面积扩展至5000平方米" },
  { year: "2016", title: "国际化布局", description: "产品出口至30多个国家和地区" },
  { year: "2019", title: "技术升级", description: "引入VR/AR技术，推出新一代产品" },
  { year: "2022", title: "品牌升级", description: "完成品牌升级，上线全球电商平台" },
  { year: "2025", title: "行业领先", description: "累计服务客户超5000家，产品覆盖80+国家" },
];

const stats = [
  { icon: Factory, label: "厂房面积", value: "10,000+", unit: "㎡" },
  { icon: Users, label: "员工人数", value: "200+", unit: "人" },
  { icon: Globe, label: "出口国家", value: "80+", unit: "国" },
  { icon: Award, label: "专利技术", value: "50+", unit: "项" },
];

export default function CompanyIntroPage() {
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
            <span className="text-foreground font-medium">公司介绍</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary to-secondary py-20">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">关于我们</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            全球领先的电玩设备制造商，专注研发与生产高品质电玩设备
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="text-center p-6 shadow-lg">
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label} ({stat.unit})
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* About Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">公司简介</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              ArcadePro 成立于2010年，总部位于中国广州番禺——全球最大的动漫游戏产业基地。
              作为一家集研发、生产、销售于一体的电玩设备制造商，我们始终致力于为全球客户提供
              高品质、创新性的电玩设备和一站式场地解决方案。
            </p>
            <p>
              公司拥有超过10,000平方米的现代化生产基地，200多名专业技术人员，
              多条自动化生产线，年产能超过50,000台。我们引进了国际先进的生产设备和检测仪器，
              建立了严格的质量管理体系，通过了ISO9001、CE、FCC等国际认证。
            </p>
            <p>
              经过十余年的发展，我们的产品已出口到全球80多个国家和地区，
              服务客户超过5,000家。产品涵盖拳击机、娃娃机、赛车机、VR设备、射击游戏机、
              彩票机、投篮机等多个品类，广泛应用于电玩城、购物中心、家庭娱乐中心、
              主题公园、KTV、影院等场所。
            </p>
            <p>
              我们坚持&ldquo;创新驱动、品质至上&rdquo;的理念，持续加大研发投入，
              目前已获得50多项专利技术。我们的设计团队紧跟国际潮流，不断推出兼具
              娱乐性、互动性和视觉吸引力的新产品，帮助客户提升场地竞争力和盈利能力。
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">发展历程</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />

              <div className="space-y-8">
                {milestones.map((item, i) => (
                  <div
                    key={i}
                    className={`relative flex items-start gap-6 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-10 mt-1" />

                    {/* Content */}
                    <div
                      className={`ml-12 md:ml-0 md:w-1/2 ${
                        i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                      }`}
                    >
                      <Card className="p-5">
                        <span className="text-sm font-bold text-primary">{item.year}</span>
                        <h3 className="font-semibold mt-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">企业愿景</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          成为全球最值得信赖的电玩设备供应商，为每一位客户创造卓越的娱乐体验
        </p>
      </div>
    </div>
  );
}