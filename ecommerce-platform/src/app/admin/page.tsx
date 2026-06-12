"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderTree, Star, Eye, MessageSquare } from "lucide-react";

const stats = [
  { label: "产品总数", value: "50", icon: Package, color: "text-blue-500" },
  { label: "分类总数", value: "12", icon: FolderTree, color: "text-green-500" },
  { label: "文章总数", value: "5", icon: Star, color: "text-yellow-500" },
  { label: "今日PV", value: "1,234", icon: Eye, color: "text-purple-500" },
  { label: "今日询价", value: "8", icon: MessageSquare, color: "text-red-500" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">欢迎回来，查看系统概览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">访问趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">图表组件 - Recharts 集成</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最新动态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "新增产品", target: "超级拳击机 Pro", time: "10分钟前" },
                { action: "更新分类", target: "拳击机", time: "1小时前" },
                { action: "处理询价", target: "INQ-20240612-001", time: "2小时前" },
                { action: "编辑文章", target: "如何选择电玩设备", time: "3小时前" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground ml-2">{log.target}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "新增产品", href: "/admin/products/new" },
              { label: "新增分类", href: "/admin/categories/new" },
              { label: "新增 Banner", href: "/admin/content/banners/new" },
              { label: "新增文章", href: "/admin/content/articles/new" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center justify-center h-12 rounded-md border border-dashed border-input hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
              >
                {action.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}