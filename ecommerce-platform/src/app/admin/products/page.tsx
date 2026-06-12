"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Search, Trash2, Archive, Eye } from "lucide-react";
import type { Product, Category } from "@/types";

interface PaginatedResponse {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "10");
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/v1/admin/products?${params}`);
      const json = await res.json();
      if (json.code === 0) {
        const data = json.data as PaginatedResponse;
        setProducts(data.list);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/categories?all=true");
      const json = await res.json();
      if (json.code === 0) {
        setCategories(json.data.list || json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  React.useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleBatchAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要对选中的 ${selectedIds.size} 个产品执行 ${action} 操作吗？`)) return;
    setActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await fetch("/api/v1/admin/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const json = await res.json();
      if (json.code === 0) {
        setSelectedIds(new Set());
        fetchProducts();
      }
    } catch (err) {
      console.error("Batch action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除此产品吗？")) return;
    try {
      const res = await fetch(`/api/v1/admin/products?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.code === 0) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default" as const;
      case "draft":
        return "secondary" as const;
      case "archived":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "已发布";
      case "draft":
        return "草稿";
      case "archived":
        return "已归档";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">产品管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理所有产品信息</p>
        </div>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          新增产品
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索产品名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="全部分类"
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              className="w-[160px]"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="全部状态"
              options={[
                { value: "published", label: "已发布" },
                { value: "draft", label: "草稿" },
                { value: "archived", label: "已归档" },
              ]}
              className="w-[140px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-md">
              <span className="text-sm text-muted-foreground">已选择 {selectedIds.size} 项</span>
              <Button size="sm" variant="outline" onClick={() => handleBatchAction("publish")} disabled={actionLoading}>
                <Eye className="h-3 w-3 mr-1" /> 发布
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBatchAction("archive")} disabled={actionLoading}>
                <Archive className="h-3 w-3 mr-1" /> 归档
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBatchAction("delete")} disabled={actionLoading}>
                <Trash2 className="h-3 w-3 mr-1" /> 删除
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无产品数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === products.length && products.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-input"
                      />
                    </TableHead>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>精选</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                          className="rounded border-input"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {product.price != null ? `¥${product.price.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(product.status)}>
                          {statusLabel(product.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.featured ? (
                          <Badge variant="default">精选</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}