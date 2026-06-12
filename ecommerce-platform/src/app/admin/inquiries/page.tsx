"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Eye } from "lucide-react";
import type { Inquiry } from "@/types";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedInquiry, setSelectedInquiry] = React.useState<Inquiry | null>(null);
  const [statusLoading, setStatusLoading] = React.useState(false);

  const fetchInquiries = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/v1/admin/inquiries?${params}`);
      const json = await res.json();
      if (json.code === 0) {
        setInquiries(json.data.list || json.data || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, statusFilter]);

  React.useEffect(() => { fetchInquiries(); }, [fetchInquiries]);
  React.useEffect(() => { setPage(1); }, [statusFilter]);

  const handleStatusChange = async (inquiry: Inquiry, newStatus: string) => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/v1/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiry.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.code === 0) {
        fetchInquiries();
        if (selectedInquiry?.id === inquiry.id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (err) { console.error(err); } finally { setStatusLoading(false); }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "pending": return "secondary" as const;
      case "processing": return "default" as const;
      case "completed": return "default" as const;
      case "closed": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { pending: "待处理", processing: "处理中", completed: "已完成", closed: "已关闭" };
    return map[status] || status;
  };

  const nextStatus = (status: string) => {
    switch (status) {
      case "pending": return "processing";
      case "processing": return "completed";
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">询价管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理客户询价记录</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="全部状态"
            options={[
              { value: "pending", label: "待处理" },
              { value: "processing", label: "处理中" },
              { value: "completed", label: "已完成" },
              { value: "closed", label: "已关闭" },
            ]} className="w-[140px]" />
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : inquiries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无询价数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>询价编号</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>电话</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-mono text-xs">{inq.inquiryNo}</TableCell>
                      <TableCell className="font-medium">{inq.name}</TableCell>
                      <TableCell>{inq.phone}</TableCell>
                      <TableCell><Badge variant={statusVariant(inq.status)}>{statusLabel(inq.status)}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(inq.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedInquiry(inq); setDetailOpen(true); }}>
                            <Eye className="h-3 w-3 mr-1" /> 详情
                          </Button>
                          {nextStatus(inq.status) && (
                            <Button size="sm" variant="outline" disabled={statusLoading} onClick={() => handleStatusChange(inq, nextStatus(inq.status)!)}>
                              {statusLabel(nextStatus(inq.status)!)}
                            </Button>
                          )}
                          {inq.status === "processing" && (
                            <Button size="sm" variant="outline" disabled={statusLoading} onClick={() => handleStatusChange(inq, "closed")}>
                              关闭
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} title="询价详情">
        {selectedInquiry && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">编号：</span>{selectedInquiry.inquiryNo}</div>
              <div><span className="text-muted-foreground">状态：</span><Badge variant={statusVariant(selectedInquiry.status)}>{statusLabel(selectedInquiry.status)}</Badge></div>
              <div><span className="text-muted-foreground">姓名：</span>{selectedInquiry.name}</div>
              <div><span className="text-muted-foreground">电话：</span>{selectedInquiry.phone}</div>
              <div><span className="text-muted-foreground">邮箱：</span>{selectedInquiry.email}</div>
              <div><span className="text-muted-foreground">预算：</span>{selectedInquiry.budget || "-"}</div>
              <div><span className="text-muted-foreground">购买时间：</span>{selectedInquiry.purchaseTime || "-"}</div>
              <div><span className="text-muted-foreground">地址：</span>{selectedInquiry.address || "-"}</div>
            </div>
            <div><span className="text-muted-foreground">留言：</span><p className="mt-1">{selectedInquiry.message || "-"}</p></div>
            <div className="text-xs text-muted-foreground">创建时间：{new Date(selectedInquiry.createdAt).toLocaleString()}</div>

            <div className="flex gap-2 pt-2 border-t">
              {selectedInquiry.status === "pending" && (
                <Button size="sm" disabled={statusLoading} onClick={() => handleStatusChange(selectedInquiry, "processing")}>开始处理</Button>
              )}
              {selectedInquiry.status === "processing" && (
                <>
                  <Button size="sm" disabled={statusLoading} onClick={() => handleStatusChange(selectedInquiry, "completed")}>标记完成</Button>
                  <Button size="sm" variant="outline" disabled={statusLoading} onClick={() => handleStatusChange(selectedInquiry, "closed")}>关闭</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}