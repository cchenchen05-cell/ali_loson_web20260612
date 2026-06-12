"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Save } from "lucide-react";
import type { Setting } from "@/types";

const SETTING_GROUPS = [
  { key: "site", label: "站点设置" },
  { key: "contact", label: "联系方式" },
  { key: "social", label: "社交媒体" },
  { key: "email", label: "邮件设置" },
  { key: "upload", label: "上传设置" },
  { key: "security", label: "安全设置" },
];

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<Setting[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeGroup, setActiveGroup] = React.useState("site");
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/admin/settings");
        const json = await res.json();
        if (json.code === 0) {
          const list = json.data.list || json.data || [];
          setSettings(list);
          const data: Record<string, string> = {};
          list.forEach((s: Setting) => { data[s.key] = s.value || ""; });
          setFormData(data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    load();
  }, []);

  const groupSettings = React.useMemo(() => {
    return settings.filter((s) => s.group === activeGroup);
  }, [settings, activeGroup]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: formData }),
      });
      const json = await res.json();
      if (json.code === 0) {
        alert("保存成功");
      } else {
        alert(json.message || "保存失败");
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">系统设置</h1>
          <p className="text-sm text-muted-foreground mt-1">管理系统配置（仅超级管理员）</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Spinner size="sm" className="mr-2" />}
          <Save className="h-4 w-4 mr-2" />
          保存设置
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {SETTING_GROUPS.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveGroup(group.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeGroup === group.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{SETTING_GROUPS.find((g) => g.key === activeGroup)?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : groupSettings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">该分组暂无设置项</div>
          ) : (
            <div className="space-y-4">
              {groupSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <label className="text-sm font-medium">{setting.key}</label>
                  <Input
                    value={formData[setting.key] || ""}
                    onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.value })}
                    placeholder={`输入 ${setting.key}`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}