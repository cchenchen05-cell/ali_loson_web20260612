"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Eye, Users, MousePointerClick, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = React.useState({ pv: 0, uv: 0, events: 0, topProducts: 0 });
  const [events, setEvents] = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [statsRes, eventsRes] = await Promise.all([
          fetch("/api/v1/admin/analytics/stats"),
          fetch(`/api/v1/admin/analytics/events?page=${page}&pageSize=10`),
        ]);
        const statsJson = await statsRes.json();
        const eventsJson = await eventsRes.json();

        if (statsJson.code === 0) {
          const d = statsJson.data;
          setStats({ pv: d.pv || 0, uv: d.uv || 0, events: d.events || 0, topProducts: d.topProducts || 0 });
        }
        if (eventsJson.code === 0) {
          setEvents(eventsJson.data.list || eventsJson.data || []);
          setTotalPages(eventsJson.data.totalPages || 1);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    load();
  }, [page]);

  const statCards = [
    { label: "今日 PV", value: stats.pv.toLocaleString(), icon: Eye, color: "text-blue-500" },
    { label: "今日 UV", value: stats.uv.toLocaleString(), icon: Users, color: "text-green-500" },
    { label: "事件总数", value: stats.events.toLocaleString(), icon: MousePointerClick, color: "text-purple-500" },
    { label: "热门产品", value: stats.topProducts.toLocaleString(), icon: TrendingUp, color: "text-orange-500" },
  ];

  const eventTypeLabel = (type: string) => {
    const map: Record<string, string> = { page_view: "页面浏览", product_click: "产品点击", inquiry_submit: "询价提交", search: "搜索", favorite: "收藏", share: "分享" };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据分析</h1>
        <p className="text-sm text-muted-foreground mt-1">查看系统数据统计和分析</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">PV / UV 趋势</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">图表占位 - 集成 Recharts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">事件分布</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">图表占位 - 集成 Recharts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Log Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">事件日志</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无事件数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>事件类型</TableHead>
                    <TableHead>页面路径</TableHead>
                    <TableHead>目标ID</TableHead>
                    <TableHead>访客ID</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((evt) => (
                    <TableRow key={evt.id as number}>
                      <TableCell><Badge variant="outline">{eventTypeLabel(String(evt.eventType || ""))}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{String(evt.pagePath || "-")}</TableCell>
                      <TableCell className="text-muted-foreground">{String(evt.targetId || "-")}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{evt.visitorId ? String(evt.visitorId).slice(0, 8) + "..." : "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(evt.createdAt as string).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}