"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Heart } from "lucide-react";

interface FavoriteItem {
  productId: number;
  productName: string;
  productSlug: string;
  likeCount: number;
  favorites: { id: number; visitorId: string; createdAt: string }[];
}

export default function FavoritesPage() {
  const [items, setItems] = React.useState<FavoriteItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/favorites?page=${page}&pageSize=10&groupBy=product`);
        const json = await res.json();
        if (json.code === 0) {
          setItems(json.data.list || json.data || []);
          setTotalPages(json.data.totalPages || 1);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    load();
  }, [page]);

  const toggleExpand = (productId: number) => {
    const next = new Set(expanded);
    if (next.has(productId)) next.delete(productId); else next.add(productId);
    setExpanded(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">收藏管理</h1>
        <p className="text-sm text-muted-foreground mt-1">按产品分组查看收藏数据</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无收藏数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>收藏数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <React.Fragment key={item.productId}>
                      <TableRow>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.productSlug}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                            <span>{item.likeCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => toggleExpand(item.productId)}
                            className="text-sm text-primary hover:underline"
                          >
                            {expanded.has(item.productId) ? "收起" : "展开详情"}
                          </button>
                        </TableCell>
                      </TableRow>
                      {expanded.has(item.productId) && item.favorites && item.favorites.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/30">
                            <div className="text-xs text-muted-foreground space-y-1">
                              {item.favorites.map((fav) => (
                                <div key={fav.id} className="flex justify-between px-4">
                                  <span>访客: {fav.visitorId ? fav.visitorId.slice(0, 12) + "..." : "未知"}</span>
                                  <span>{new Date(fav.createdAt).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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