"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Ban, CheckCircle } from "lucide-react";
import type { User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ username: "", email: "", password: "", role: "editor", isActive: true });

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users?page=${page}&pageSize=10`);
      const json = await res.json();
      if (json.code === 0) {
        setUsers(json.data.list || json.data || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page]);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim()) { alert("用户名和邮箱为必填项"); return; }
    if (!editing && !form.password) { alert("请输入密码"); return; }
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body: Record<string, unknown> = { id: editing?.id, username: form.username.trim(), email: form.email.trim(), role: form.role, isActive: form.isActive };
      if (form.password) body.password = form.password;
      const res = await fetch("/api/v1/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code === 0) {
        if (!editing && form.password) {
          alert(`用户创建成功！密码：${form.password}`);
        }
        setDialogOpen(false); fetchUsers();
      } else { alert(json.message); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? "禁用" : "启用";
    if (!confirm(`确定要${action}此用户吗？`)) return;
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      const json = await res.json();
      if (json.code === 0) fetchUsers();
    } catch (err) { console.error(err); }
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = { superadmin: "超级管理员", admin: "管理员", editor: "编辑" };
    return map[role] || role;
  };

  const roleVariant = (role: string) => {
    switch (role) {
      case "superadmin": return "default" as const;
      case "admin": return "secondary" as const;
      case "editor": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理后台用户（仅超级管理员）</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ username: "", email: "", password: generatePassword(), role: "editor", isActive: true }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> 新增用户
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无用户数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell><Badge variant={roleVariant(user.role)}>{roleLabel(user.role)}</Badge></TableCell>
                      <TableCell><Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "启用" : "禁用"}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "从未登录"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditing(user); setForm({ username: user.username, email: user.email, password: "", role: user.role, isActive: user.isActive }); setDialogOpen(true); }}>
                            <Pencil className="h-3 w-3 mr-1" /> 编辑
                          </Button>
                          <Button size="sm" variant="ghost" className={user.isActive ? "text-destructive" : "text-green-600"} onClick={() => handleToggleActive(user)}>
                            {user.isActive ? <><Ban className="h-3 w-3 mr-1" /> 禁用</> : <><CheckCircle className="h-3 w-3 mr-1" /> 启用</>}
                          </Button>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "编辑用户" : "新增用户"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">用户名 *</label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="space-y-2"><label className="text-sm font-medium">邮箱 *</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{editing ? "新密码（留空不修改）" : "密码 *"}</label>
            <div className="flex gap-2">
              <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "留空不修改" : "输入密码"} required={!editing} />
              <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, password: generatePassword() })}>随机生成</Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">角色</label>
            <Select value={form.role} onChange={(v) => setForm({ ...form, role: v })}
              options={[
                { value: "superadmin", label: "超级管理员" },
                { value: "admin", label: "管理员" },
                { value: "editor", label: "编辑" },
              ]} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-input" />
            <label className="text-sm">启用账号</label>
          </div>
          <div className="flex gap-3 pt-2"><Button type="submit" disabled={saving}>{saving && <Spinner size="sm" className="mr-2" />}保存</Button><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button></div>
        </form>
      </Dialog>
    </div>
  );
}