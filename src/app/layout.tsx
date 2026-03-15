import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toolbox | toolbox.apexcosmos.com",
  description: "一站式实用工具平台，助力效率飞跃",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                <p>© 2026 Toolbox - toolbox.apexcosmos.com. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <Link href="/pricing" className="hover:text-blue-600 transition-colors">价格方案</Link>
                  <Link href="/changelog" className="hover:text-blue-600 transition-colors">更新日志</Link>
                  <a href="mailto:zevizhang@gmail.com" className="hover:text-blue-600 transition-colors">联系我们</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
