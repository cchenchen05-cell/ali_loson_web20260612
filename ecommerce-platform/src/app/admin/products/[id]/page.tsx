"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Save } from "lucide-react";
import type { Category, Product } from "@/types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [form, setForm] = React.useState({
    categoryId: "",
    name: "",
    slug: "",
    price: "",
    summary: "",
    description: "",
    coverImage: "",
    images: "",
    featured: false,
    status: "draft",
    sortOrder: "0",
  });

  React.useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/v1/admin/products?id=${id}`),
          fetch("/api/v1/admin/categories?all=true"),
        ]);
        const prodJson = await prodRes.json();
        const catJson = await catRes.json();

        if (catJson.code === 0) {
          setCategories(catJson.data.list || catJson.data || []);
        }

        if (prodJson.code === 0) {
          const product: Product = prodJson.data;
          setForm({
            categoryId: String(product.categoryId),
            name: product.name,
            slug: product.slug,
            price: product.price != null ? String(product.price) : "",
            summary: product.summary || "",
            description: product.description || "",
            coverImage: product.coverImage || "",
            images: product.images || "",
            featured: product.featured,
            status: product.status,
            sortOrder: String(product.sortOrder),
          });
        } else {
          alert("产品不存在");
          router.push("/admin/products");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [id, router]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.categoryId) errs.categoryId = "请选择分类";
    if (!form.name.trim()) errs.name = "请输入产品名称";
    if (!form.slug.trim()) errs.slug = "请输入 Slug";
    if (form.price && isNaN(Number(form.price))) errs.price = "请输入有效价格";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          categoryId: Number(form.categoryId),
          name: form.name.trim(),
          slug: form.slug.trim(),
          price: form.price ? Number(form.price) : null,
          summary: form.summary.trim() || null,
          description: form.description.trim() || null,
          coverImage: form.coverImage.trim() || null,
          images: form.images.trim() || null,
          featured: form.featured,
          status: form.status,
          sortOrder: Number(form.sortOrder),
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(json.message || "更新失败");
      }
    } catch (err) {
      console.error("Update product failed:", err);
      alert("更新产品失败");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">编辑产品</h1>
          <p className="text-sm text-muted-foreground mt-1">修改产品信息 #{id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">产品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">分类 *</label>
                <Select
                  value={form.categoryId}
                  onChange={(v) => setForm({ ...form, categoryId: v })}
                  placeholder="选择分类"
                  options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                />
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">产品名称 *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="输入产品名称"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug *</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="product-slug"
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">价格</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">排序</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={[
                    { value: "draft", label: "草稿" },
                    { value: "published", label: "已发布" },
                    { value: "archived", label: "已归档" },
                  ]}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">简述</label>
                <Input
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="简要描述"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">详细描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="详细描述产品"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">封面图片 URL</label>
                <Input
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">图片 URLs (JSON 数组)</label>
                <Input
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder='[{"url":"...","alt":"..."}]'
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-input"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  精选产品
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" className="mr-2" />}
                <Save className="h-4 w-4 mr-2" />
                保存修改
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}