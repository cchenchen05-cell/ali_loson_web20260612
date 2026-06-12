"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import { Search, Menu, X, Heart, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  locale: string;
  messages: Record<string, any>;
}

export function Navbar({ locale, messages }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();
  const t = (key: string) => {
    const keys = key.split(".");
    let result: any = messages;
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  const navItems = [
    { href: `/${locale}`, label: t("common.home") },
    { href: `/${locale}/products`, label: t("common.products") },
    { href: `/${locale}/venue`, label: t("common.venue") },
    { href: `/${locale}/contact`, label: t("common.contact") },
    { href: `/${locale}/about/intro`, label: t("common.about") },
  ];

  const toggleLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ArcadePro
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={t("common.search")}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Link href={`/${locale}/products`}>
            <Button variant="ghost" size="icon" aria-label={t("common.favorites")}>
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t bg-background">
          <div className="container mx-auto px-4 py-3">
            <input
              type="search"
              placeholder={t("common.search")}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:bg-accent"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}