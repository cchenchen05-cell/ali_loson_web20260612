"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <AdminSidebar role="superadmin" className="hidden lg:flex lg:w-60 lg:flex-col" />

        {/* Sidebar - Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <AdminSidebar
              role="superadmin"
              className="fixed left-0 top-0 bottom-0 w-60 z-50"
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b flex items-center justify-between px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, Admin</span>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}