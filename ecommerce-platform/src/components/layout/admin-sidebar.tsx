"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Star,
  BarChart3,
  MessageSquare,
  Heart,
  ScrollText,
  Users,
  Eye,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  role: string;
  className?: string;
  onClose?: () => void;
}

const superadminMenus = [
  { key: "dashboard", label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "产品管理", href: "/admin/products", icon: Package },
  { key: "categories", label: "分类管理", href: "/admin/categories", icon: FolderTree },
  { key: "content", label: "内容管理", href: "/admin/content", icon: FileText },
  { key: "reviews", label: "评价管理", href: "/admin/reviews", icon: Star },
  { key: "analytics", label: "数据分析", href: "/admin/analytics", icon: BarChart3 },
  { key: "inquiries", label: "询价管理", href: "/admin/inquiries", icon: MessageSquare },
  { key: "favorites", label: "收藏管理", href: "/admin/favorites", icon: Heart },
  { key: "logs", label: "操作日志", href: "/admin/logs", icon: ScrollText },
  { key: "users", label: "用户管理", href: "/admin/users", icon: Users },
  { key: "visitors", label: "访客管理", href: "/admin/visitors", icon: Eye },
  { key: "settings", label: "系统设置", href: "/admin/settings", icon: Settings },
];

const adminMenus = superadminMenus.filter((m) => m.key !== "users" && m.key !== "settings");
const editorMenus = superadminMenus.filter(
  (m) => !["analytics", "users", "visitors", "settings"].includes(m.key)
);

export function AdminSidebar({ role, className, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const menus = role === "superadmin" ? superadminMenus : role === "admin" ? adminMenus : editorMenus;

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ArcadePro
          </span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href));
          return (
            <Link
              key={menu.key}
              href={menu.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              {menu.label}
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="p-4">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}