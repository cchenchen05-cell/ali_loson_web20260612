"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import type { Visitor } from "@/types";

export default function VisitorsPage() {
  const [visitors, setVisitors] = React.useState<Visitor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/visitors?page=${page}&pageSize=10`);
        const json = await res.json();
        if (json.code === 0) {
          setVisitors(json.data.list || json.data || []);
          setTotalPages(json.data.totalPages || 1);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">访客管理</h1>
        <p className="text-sm text-muted-foreground mt-1">查看网站访客记录</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : visitors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无访客数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>指纹</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>国家/地区</TableHead>
                    <TableHead>访问次数</TableHead>
                    <TableHead>首次访问</TableHead>
                    <TableHead>最后访问</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-mono text-xs">{visitor.fingerprint.slice(0, 16)}...</TableCell>
                      <TableCell className="text-muted-foreground">{visitor.ipAddress || "-"}</TableCell>
                      <TableCell>
                        {visitor.country ? (
                          <span>
                            {visitor.country}
                            {visitor.region ? `, ${visitor.region}` : ""}
                            {visitor.city ? `, ${visitor.city}` : ""}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{visitor.visitCount}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(visitor.firstVisitAt).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(visitor.lastVisitAt).toLocaleString()}</TableCell>
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