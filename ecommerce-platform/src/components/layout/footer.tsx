"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, MessageCircle, Play, Briefcase, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  locale: string;
  messages: Record<string, any>;
}

export function Footer({ locale, messages }: FooterProps) {
  const t = (key: string) => {
    const keys = key.split(".");
    let result: any = messages;
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ArcadePro
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {locale === "zh"
                ? "全球领先的电玩设备制造商，专注研发与生产高品质电玩设备。"
                : "Leading arcade equipment manufacturer, focused on R&D and production."}
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Play className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Briefcase className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {locale === "zh" ? "快速链接" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/products`} className="text-muted-foreground hover:text-foreground transition-colors">{t("common.products")}</Link></li>
              <li><Link href={`/${locale}/venue`} className="text-muted-foreground hover:text-foreground transition-colors">{t("common.venue")}</Link></li>
              <li><Link href={`/${locale}/about/intro`} className="text-muted-foreground hover:text-foreground transition-colors">{t("about.intro")}</Link></li>
              <li><Link href={`/${locale}/about/catalog`} className="text-muted-foreground hover:text-foreground transition-colors">{t("about.catalog")}</Link></li>
              <li><Link href={`/${locale}/about/articles`} className="text-muted-foreground hover:text-foreground transition-colors">{t("about.articles")}</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">
              {locale === "zh" ? "产品分类" : "Categories"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/products?category=boxing-machine`} className="text-muted-foreground hover:text-foreground transition-colors">{locale === "zh" ? "拳击机" : "Boxing Machine"}</Link></li>
              <li><Link href={`/${locale}/products?category=claw-machine`} className="text-muted-foreground hover:text-foreground transition-colors">{locale === "zh" ? "娃娃机" : "Claw Machine"}</Link></li>
              <li><Link href={`/${locale}/products?category=racing-machine`} className="text-muted-foreground hover:text-foreground transition-colors">{locale === "zh" ? "赛车机" : "Racing Machine"}</Link></li>
              <li><Link href={`/${locale}/products?category=vr-equipment`} className="text-muted-foreground hover:text-foreground transition-colors">{locale === "zh" ? "VR设备" : "VR Equipment"}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("contact.title")}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{locale === "zh" ? "广东省广州市番禺区" : "Panyu District, Guangzhou, China"}</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+86 400-123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@example.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ArcadePro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}