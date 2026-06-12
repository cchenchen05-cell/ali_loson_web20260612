import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcadePro - 电玩设备制造商",
  description: "全球领先的电玩设备制造商，专注研发与生产高品质电玩设备",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}