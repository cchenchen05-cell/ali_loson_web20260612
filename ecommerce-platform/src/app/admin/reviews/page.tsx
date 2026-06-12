"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { Review } from "@/types";

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Review | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [form, setForm] = React.useState({ clientName: "", content: "", rating: 5, status: "published", avatarUrl: "", videoUrl: "", tags: "" });

  const fetchReviews = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/v1/admin/reviews?${params}`);
      const json = await res.json();
      if (json.code === 0) {
        setReviews(json.data.list || json.data || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, statusFilter]);

  React.useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/v1/admin/reviews", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          clientName: form.clientName.trim() || null,
          content: form.content.trim() || null,
          rating: form.rating,
          status: form.status,
          avatarUrl: form.avatarUrl.trim() || null,
          videoUrl: form.videoUrl.trim() || null,
          tags: form.tags.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.code === 0) { setDialogOpen(false); fetchReviews(); } else { alert(json.message); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除此评论吗？")) return;
    await fetch(`/api/v1/admin/reviews?id=${id}`, { method: "DELETE" });
    fetchReviews();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`h-3 w-3 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">评价管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理客户评价和展示</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ clientName: "", content: "", rating: 5, status: "published", avatarUrl: "", videoUrl: "", tags: "" }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> 新增评价
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} placeholder="全部状态"
            options={[{ value: "published", label: "已发布" }, { value: "draft", label: "草稿" }]} className="w-[140px]" />
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无评价数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客户</TableHead>
                    <TableHead>评价内容</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.clientName || "匿名"}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">{r.content || "-"}</TableCell>
                      <TableCell>{renderStars(r.rating)}</TableCell>
                      <TableCell><Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status === "published" ? "已发布" : "草稿"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setForm({ clientName: r.clientName || "", content: r.content || "", rating: r.rating, status: r.status, avatarUrl: r.avatarUrl || "", videoUrl: r.videoUrl || "", tags: r.tags || "" }); setDialogOpen(true); }}><Pencil className="h-3 w-3 mr-1" /> 编辑</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3 mr-1" /> 删除</Button>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "编辑评价" : "新增评价"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">客户名称</label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="客户名称" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">评价内容</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">评分 ({form.rating})</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                  <Star className={`h-5 w-5 ${s <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">状态</label><Select value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[{ value: "published", label: "已发布" }, { value: "draft", label: "草稿" }]} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">头像 URL</label><Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">视频 URL</label><Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">标签</label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="逗号分隔" /></div>
          <div className="flex gap-3 pt-2"><Button type="submit" disabled={saving}>{saving && <Spinner size="sm" className="mr-2" />}保存</Button><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button></div>
        </form>
      </Dialog>
    </div>
  );
}