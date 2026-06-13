"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import { Search, Menu, X, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  locale: string;
  messages: Record<string, any>;
}

export function Navbar({ locale, messages }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isAnimating, setIsAnimating] = React.useState(false);
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

  React.useEffect(() => {
    setIsAnimating(inputValue.trim().length > 0);
  }, [inputValue]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
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
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/5 hover:border-white/10 border border-transparent"
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
            className="hover:bg-white/10"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            aria-label="Toggle language"
            className="hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Link href={`/${locale}/products`}>
            <Button variant="ghost" size="icon" aria-label={t("common.favorites")} className="hover:bg-white/10">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Search bar - Gemini style */}
      {searchOpen && (
        <div className="border-t border-white/10 glass">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-3xl mx-auto">
              <div 
                className={`w-full p-[1px] rounded-2xl transition-all duration-500 ${
                  isAnimating 
                    ? 'gemini-flow-pipe' 
                    : 'border border-white/10 bg-[#131314]'
                }`}
              >
                <div className="relative rounded-2xl bg-[#131314] px-6 py-4 flex items-center gap-4">
                  <Search className="h-5 w-5 text-white/40 shrink-0" />
                  <input
                    type="search"
                    placeholder={t("common.search")}
                    className="flex-1 bg-transparent border-0 outline-none text-white text-[15px] placeholder-white/40"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 glass">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-foreground/70 hover:bg-white/5 border border-transparent"
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