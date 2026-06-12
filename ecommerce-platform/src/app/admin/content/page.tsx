"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Banner, Article, Announcement } from "@/types";

const TABS = [
  { key: "banners", label: "Banners" },
  { key: "articles", label: "文章" },
  { key: "announcements", label: "公告" },
  { key: "static", label: "静态内容" },
];

// ---- Banners Tab ----
function BannersTab() {
  const [items, setItems] = React.useState<Banner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Banner | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", imageUrl: "", linkUrl: "", sortOrder: "0", isActive: true, startAt: "", endAt: "" });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/banners?page=${page}&pageSize=10`);
      const json = await res.json();
      if (json.code === 0) {
        setItems(json.data.list || json.data || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/v1/admin/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          title: form.title.trim() || null,
          imageUrl: form.imageUrl.trim(),
          linkUrl: form.linkUrl.trim() || null,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
          startAt: form.startAt || null,
          endAt: form.endAt || null,
        }),
      });
      const json = await res.json();
      if (json.code === 0) { setDialogOpen(false); fetchData(); } else { alert(json.message); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除吗？")) return;
    await fetch(`/api/v1/admin/banners?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title || "", imageUrl: b.imageUrl, linkUrl: b.linkUrl || "", sortOrder: String(b.sortOrder), isActive: b.isActive, startAt: b.startAt || "", endAt: b.endAt || "" });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", imageUrl: "", linkUrl: "", sortOrder: "0", isActive: true, startAt: "", endAt: "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}><Plus className="h-3 w-3 mr-1" /> 新增</Button>
      </div>
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">暂无数据</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>图片</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title || "-"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{b.imageUrl}</TableCell>
                  <TableCell>{b.sortOrder}</TableCell>
                  <TableCell><Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "启用" : "停用"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-3 w-3 mr-1" /> 编辑</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-3 w-3 mr-1" /> 删除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "编辑 Banner" : "新增 Banner"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">标题</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">图片 URL *</label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required /></div>
          <div className="space-y-2"><label className="text-sm font-medium">链接 URL</label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">排序</label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><label className="text-sm">启用</label></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><label className="text-sm font-medium">开始时间</label><Input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">结束时间</label><Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-2"><Button type="submit" disabled={saving}>{saving && <Spinner size="sm" className="mr-2" />}保存</Button><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

// ---- Articles Tab ----
function ArticlesTab() {
  const [items, setItems] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/articles?page=${page}&pageSize=10`);
        const json = await res.json();
        if (json.code === 0) {
          setItems(json.data.list || json.data || []);
          setTotalPages(json.data.totalPages || 1);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    load();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除吗？")) return;
    await fetch(`/api/v1/admin/articles?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => window.location.href = "/admin/content/articles/new"}><Plus className="h-3 w-3 mr-1" /> 新增</Button>
      </div>
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">暂无数据</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="text-muted-foreground">{a.slug}</TableCell>
                  <TableCell><Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status === "published" ? "已发布" : "草稿"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{a.publishedAt || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => window.location.href = `/admin/content/articles/${a.id}`}><Pencil className="h-3 w-3 mr-1" /> 编辑</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3 mr-1" /> 删除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ---- Announcements Tab ----
function AnnouncementsTab() {
  const [items, setItems] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Announcement | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ content: "", isPinned: false, startAt: "", endAt: "" });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/announcements");
      const json = await res.json();
      if (json.code === 0) setItems(json.data.list || json.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/v1/admin/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing?.id, content: form.content.trim(), isPinned: form.isPinned, startAt: form.startAt || null, endAt: form.endAt || null }),
      });
      const json = await res.json();
      if (json.code === 0) { setDialogOpen(false); fetchData(); } else { alert(json.message); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除吗？")) return;
    await fetch(`/api/v1/admin/announcements?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditing(null); setForm({ content: "", isPinned: false, startAt: "", endAt: "" }); setDialogOpen(true); }}><Plus className="h-3 w-3 mr-1" /> 新增</Button>
      </div>
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">暂无数据</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>内容</TableHead>
              <TableHead>置顶</TableHead>
              <TableHead>有效期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="max-w-[400px] truncate">{a.content}</TableCell>
                <TableCell><Badge variant={a.isPinned ? "default" : "secondary"}>{a.isPinned ? "是" : "否"}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-xs">{a.startAt || "-"} ~ {a.endAt || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setForm({ content: a.content, isPinned: a.isPinned, startAt: a.startAt || "", endAt: a.endAt || "" }); setDialogOpen(true); }}><Pencil className="h-3 w-3 mr-1" /> 编辑</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3 mr-1" /> 删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "编辑公告" : "新增公告"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">内容 *</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} /><label className="text-sm">置顶</label></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><label className="text-sm font-medium">开始</label><Input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">结束</label><Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-2"><Button type="submit" disabled={saving}>{saving && <Spinner size="sm" className="mr-2" />}保存</Button><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

// ---- Static Content Tab ----
function StaticContentTab() {
  interface StaticContentItem { id: number; key: string; title?: string | null; content?: string | null; images?: string | null; }
  const [items, setItems] = React.useState<StaticContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StaticContentItem | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ key: "", title: "", content: "", images: "" });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/static-content");
      const json = await res.json();
      if (json.code === 0) setItems(json.data.list || json.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/v1/admin/static-content", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing?.id, key: form.key.trim(), title: form.title.trim() || null, content: form.content.trim() || null, images: form.images.trim() || null }),
      });
      const json = await res.json();
      if (json.code === 0) { setDialogOpen(false); fetchData(); } else { alert(json.message); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除吗？")) return;
    await fetch(`/api/v1/admin/static-content?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditing(null); setForm({ key: "", title: "", content: "", images: "" }); setDialogOpen(true); }}><Plus className="h-3 w-3 mr-1" /> 新增</Button>
      </div>
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">暂无数据</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>内容预览</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.key}</TableCell>
                <TableCell>{item.title || "-"}</TableCell>
                <TableCell className="text-muted-foreground max-w-[300px] truncate">{item.content || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(item); setForm({ key: item.key, title: item.title || "", content: item.content || "", images: item.images || "" }); setDialogOpen(true); }}><Pencil className="h-3 w-3 mr-1" /> 编辑</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3 mr-1" /> 删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "编辑静态内容" : "新增静态内容"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Key *</label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required /></div>
          <div className="space-y-2"><label className="text-sm font-medium">标题</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">内容</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">图片 (JSON)</label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></div>
          <div className="flex gap-3 pt-2"><Button type="submit" disabled={saving}>{saving && <Spinner size="sm" className="mr-2" />}保存</Button><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = React.useState("banners");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">内容管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理 Banners、文章、公告和静态内容</p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {activeTab === "banners" && <BannersTab />}
          {activeTab === "articles" && <ArticlesTab />}
          {activeTab === "announcements" && <AnnouncementsTab />}
          {activeTab === "static" && <StaticContentTab />}
        </CardContent>
      </Card>
    </div>
  );
}