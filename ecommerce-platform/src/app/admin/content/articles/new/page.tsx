"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { SlugInput } from "@/components/ui/slug-input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ArrowLeft, Save } from "lucide-react";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    content: "",
    coverImage: "",
    tags: "",
    status: "draft",
  });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "请输入标题";
    if (!form.slug.trim()) errs.slug = "请输入 Slug";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          content: form.content.trim() || null,
          coverImage: form.coverImage.trim() || null,
          tags: form.tags.trim() || null,
          status: form.status,
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        router.push("/admin/content");
        router.refresh();
      } else {
        alert(json.message || "创建失败");
      }
    } catch (err) {
      console.error("Create article failed:", err);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">新增文章</h1>
          <p className="text-sm text-muted-foreground mt-1">创建新的文章内容</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">文章信息</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">标题 *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="文章标题" />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug *</label>
                <SlugInput value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} source={form.title} />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">封面图片</label>
                <ImageUploader value={form.coverImage} onChange={(v) => setForm({ ...form, coverImage: v })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">内容（支持HTML）</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  placeholder="<p>文章内容...</p>"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">标签</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="逗号分隔" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <Select value={form.status} onChange={(v) => setForm({ ...form, status: v })}
                  options={[{ value: "draft", label: "草稿" }, { value: "published", label: "已发布" }]} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" className="mr-2" />}
                <Save className="h-4 w-4 mr-2" />保存
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}