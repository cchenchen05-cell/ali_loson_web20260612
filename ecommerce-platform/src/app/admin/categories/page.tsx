"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import type { Category } from "@/types";

function buildTree(categories: Category[]): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];
  for (const c of categories) {
    map.set(c.id, { ...c, children: [] });
  }
  for (const c of categories) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

interface CategoryTreeNodeProps {
  category: Category;
  depth: number;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
  allCategories: Category[];
}

function CategoryTreeNode({ category, depth, expanded, onToggle, onEdit, onDelete, allCategories }: CategoryTreeNodeProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expanded.has(category.id);

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center" style={{ paddingLeft: depth * 24 }}>
            {hasChildren ? (
              <button onClick={() => onToggle(category.id)} className="mr-1 p-0.5 hover:bg-muted rounded">
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            ) : (
              <span className="w-5 mr-1" />
            )}
            <span className="text-muted-foreground mr-2">{category.id}</span>
            <span className="font-medium">{category.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
        <TableCell className="text-muted-foreground">{category.sortOrder}</TableCell>
        <TableCell className="text-muted-foreground">
          {category.parentId ? allCategories.find((c) => c.id === category.parentId)?.name || "-" : "-"}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => onEdit(category)}>
              <Pencil className="h-3 w-3 mr-1" /> 编辑
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(category.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> 删除
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && hasChildren && category.children!.map((child) => (
        <CategoryTreeNode
          key={child.id}
          category={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          allCategories={allCategories}
        />
      ))}
    </>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    slug: "",
    parentId: "",
    sortOrder: "0",
    description: "",
    icon: "",
    image: "",
    previewImage: "",
  });

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/categories?all=true");
      const json = await res.json();
      if (json.code === 0) {
        const list = json.data.list || json.data || [];
        setCategories(list);
        setExpanded(new Set(list.map((c: Category) => c.id)));
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const tree = React.useMemo(() => buildTree(categories), [categories]);

  const handleToggle = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ? String(cat.parentId) : "",
      sortOrder: String(cat.sortOrder),
      description: cat.description || "",
      icon: cat.icon || "",
      image: cat.image || "",
      previewImage: cat.previewImage || "",
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setForm({
      name: "",
      slug: "",
      parentId: "",
      sortOrder: "0",
      description: "",
      icon: "",
      image: "",
      previewImage: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      alert("名称和 Slug 为必填项");
      return;
    }
    setSaving(true);
    try {
      const method = editingCategory ? "PUT" : "POST";
      const res = await fetch("/api/v1/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory?.id,
          name: form.name.trim(),
          slug: form.slug.trim(),
          parentId: form.parentId ? Number(form.parentId) : null,
          sortOrder: Number(form.sortOrder),
          description: form.description.trim() || null,
          icon: form.icon.trim() || null,
          image: form.image.trim() || null,
          previewImage: form.previewImage.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        setDialogOpen(false);
        fetchCategories();
      } else {
        alert(json.message || "保存失败");
      }
    } catch (err) {
      console.error("Save category failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除此分类吗？")) return;
    try {
      const res = await fetch(`/api/v1/admin/categories?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.code === 0) {
        fetchCategories();
      }
    } catch (err) {
      console.error("Delete category failed:", err);
    }
  };

  const parentOptions = [
    { value: "", label: "无（顶级分类）" },
    ...categories
      .filter((c) => !editingCategory || c.id !== editingCategory.id)
      .map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分类管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理产品分类树形结构</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          新增分类
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无分类数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>父分类</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tree.map((cat) => (
                  <CategoryTreeNode
                    key={cat.id}
                    category={cat}
                    depth={0}
                    expanded={expanded}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    allCategories={categories}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingCategory ? "编辑分类" : "新增分类"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名称 *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="分类名称" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug *</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">父分类</label>
            <Select value={form.parentId} onChange={(v) => setForm({ ...form, parentId: v })} options={parentOptions} placeholder="无（顶级分类）" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">排序</label>
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="分类描述" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon URL</label>
            <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">图片 URL</label>
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">预览图 URL</label>
            <Input value={form.previewImage} onChange={(e) => setForm({ ...form, previewImage: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Spinner size="sm" className="mr-2" />}
              保存
            </Button>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}